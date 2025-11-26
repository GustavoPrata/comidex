package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"syscall"
	"time"
	"unsafe"
)

const (
	VERSION       = "2.0.0"
	CONFIG_FILE   = "comidex-printer.json"
	POLL_INTERVAL = 3 * time.Second
)

type Config struct {
	ServerURL  string `json:"server_url"`
	AgentToken string `json:"agent_token"`
	AgentName  string `json:"agent_name"`
}

type Printer struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	IP       string `json:"ip_address"`
	Port     int    `json:"port"`
	Type     string `json:"connection_type"` // "network" or "usb"
	Location string `json:"location"`
	Status   string `json:"status"`
}

type PrintJob struct {
	ID           int    `json:"id"`
	PrinterID    int    `json:"printer_id"`
	PrinterName  string `json:"printer_name"`
	PrinterIP    string `json:"printer_ip"`
	PrinterPort  int    `json:"printer_port"`
	PrinterType  string `json:"printer_type"`
	DocumentType string `json:"document_type"`
	Status       string `json:"status"`
	Data         string `json:"data"`
	TableName    string `json:"table_name"`
	ItemName     string `json:"item_name"`
	Quantity     int    `json:"quantity"`
	Notes        string `json:"notes"`
	OrderID      int    `json:"order_id"`
	CreatedAt    string `json:"created_at"`
}

type JobsResponse struct {
	Success  bool       `json:"success"`
	Jobs     []PrintJob `json:"jobs"`
	Printers []Printer  `json:"printers"`
}

type JobResultRequest struct {
	JobID        int    `json:"job_id"`
	Status       string `json:"status"`
	ErrorMessage string `json:"error_message,omitempty"`
}

var (
	modwinspool          = syscall.NewLazyDLL("winspool.drv")
	procOpenPrinterW     = modwinspool.NewProc("OpenPrinterW")
	procClosePrinter     = modwinspool.NewProc("ClosePrinter")
	procStartDocPrinterW = modwinspool.NewProc("StartDocPrinterW")
	procEndDocPrinter    = modwinspool.NewProc("EndDocPrinter")
	procStartPagePrinter = modwinspool.NewProc("StartPagePrinter")
	procEndPagePrinter   = modwinspool.NewProc("EndPagePrinter")
	procWritePrinter     = modwinspool.NewProc("WritePrinter")
)

type DOC_INFO_1 struct {
	DocName    *uint16
	OutputFile *uint16
	Datatype   *uint16
}

var printerCache = make(map[int]Printer)

func main() {
	clearScreen()
	fmt.Println("╔══════════════════════════════════════════════════════════════╗")
	fmt.Println("║       ComideX Printer Bridge v" + VERSION + "                        ║")
	fmt.Println("║       Proxy de Impressoras Local → Replit                    ║")
	fmt.Println("╚══════════════════════════════════════════════════════════════╝")
	fmt.Println()

	config, err := loadOrCreateConfig()
	if err != nil {
		log.Fatalf("Erro ao carregar configuração: %v", err)
	}

	fmt.Printf("📡 Servidor: %s\n", config.ServerURL)
	fmt.Printf("🏷️  Agente: %s\n", config.AgentName)
	fmt.Printf("🔄 Intervalo: %v\n\n", POLL_INTERVAL)

	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Println("📋 MODO BRIDGE: Todas as impressoras configuradas no admin")
	fmt.Println("   serão acessíveis através deste agente!")
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Println()

	fmt.Println("✅ Bridge iniciado! Conectando ao servidor...")
	fmt.Println("   Pressione Ctrl+C para sair\n")

	for {
		processJobs(config)
		time.Sleep(POLL_INTERVAL)
	}
}

func clearScreen() {
	if runtime.GOOS == "windows" {
		cmd := exec.Command("cmd", "/c", "cls")
		cmd.Stdout = os.Stdout
		cmd.Run()
	}
}

func loadOrCreateConfig() (*Config, error) {
	exePath, err := os.Executable()
	if err != nil {
		exePath = "."
	}
	configPath := filepath.Join(filepath.Dir(exePath), CONFIG_FILE)

	data, err := os.ReadFile(configPath)
	if err != nil {
		fmt.Println("⚙️  Primeira execução - Configuração do Bridge")
		fmt.Println()

		config := &Config{}

		fmt.Print("URL do servidor Replit (ex: https://seu-app.replit.app): ")
		fmt.Scanln(&config.ServerURL)
		config.ServerURL = strings.TrimSpace(config.ServerURL)
		config.ServerURL = strings.TrimSuffix(config.ServerURL, "/")

		fmt.Print("Token do agente (padrão: comidex-agent-2024): ")
		fmt.Scanln(&config.AgentToken)
		config.AgentToken = strings.TrimSpace(config.AgentToken)
		if config.AgentToken == "" {
			config.AgentToken = "comidex-agent-2024"
		}

		fmt.Print("Nome deste PC/Bridge (ex: Restaurante-PC): ")
		fmt.Scanln(&config.AgentName)
		config.AgentName = strings.TrimSpace(config.AgentName)
		if config.AgentName == "" {
			config.AgentName = "Bridge-Principal"
		}

		jsonData, err := json.MarshalIndent(config, "", "  ")
		if err != nil {
			return nil, err
		}
		if err := os.WriteFile(configPath, jsonData, 0644); err != nil {
			return nil, err
		}

		fmt.Printf("\n✅ Configuração salva em: %s\n\n", configPath)
		return config, nil
	}

	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	return &config, nil
}

func processJobs(config *Config) {
	client := &http.Client{Timeout: 30 * time.Second}

	req, err := http.NewRequest("GET", config.ServerURL+"/api/agent/jobs", nil)
	if err != nil {
		log.Printf("Erro ao criar request: %v", err)
		return
	}

	req.Header.Set("Authorization", "Bearer "+config.AgentToken)
	req.Header.Set("X-Agent-Name", config.AgentName)
	req.Header.Set("X-Agent-Version", VERSION)
	req.Header.Set("X-Agent-Mode", "bridge")

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("❌ Erro ao conectar: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("❌ Erro (%d): %s", resp.StatusCode, string(body))
		return
	}

	var jobsResp JobsResponse
	if err := json.NewDecoder(resp.Body).Decode(&jobsResp); err != nil {
		log.Printf("Erro ao decodificar: %v", err)
		return
	}

	if !jobsResp.Success {
		return
	}

	for _, printer := range jobsResp.Printers {
		printerCache[printer.ID] = printer
	}

	if len(jobsResp.Printers) > 0 && len(jobsResp.Jobs) == 0 {
		printPrinterStatus(jobsResp.Printers)
	}

	for _, job := range jobsResp.Jobs {
		printer := getPrinter(job)
		
		fmt.Printf("\n📄 Job #%d\n", job.ID)
		fmt.Printf("   🖨️  Impressora: %s (%s)\n", printer.Name, printer.IP)
		fmt.Printf("   🍽️  Mesa: %s\n", job.TableName)
		fmt.Printf("   📝 Item: %dx %s\n", job.Quantity, job.ItemName)

		var printErr error
		
		if printer.Type == "usb" || printer.Type == "windows" {
			if runtime.GOOS == "windows" {
				printErr = printToWindowsPrinter(printer.Name, job)
			} else {
				printErr = printToLPR(printer.Name, job)
			}
		} else {
			ip := printer.IP
			if ip == "" {
				ip = job.PrinterIP
			}
			port := printer.Port
			if port == 0 {
				port = 9100
			}
			printErr = printToNetworkPrinter(ip, port, job)
		}

		status := "printed"
		errorMsg := ""
		if printErr != nil {
			status = "failed"
			errorMsg = printErr.Error()
			fmt.Printf("   ❌ FALHA: %v\n", printErr)
		} else {
			fmt.Println("   ✅ Impresso com sucesso!")
		}

		reportJobResult(config, job.ID, status, errorMsg)
	}
}

var lastPrinterPrint time.Time

func printPrinterStatus(printers []Printer) {
	if time.Since(lastPrinterPrint) < 30*time.Second {
		return
	}
	lastPrinterPrint = time.Now()

	fmt.Println("\n🖨️  Impressoras conectadas via Bridge:")
	for _, p := range printers {
		status := "🟢"
		if p.Status == "offline" {
			status = "🔴"
		}
		connInfo := p.IP
		if p.Type == "usb" || p.Type == "windows" {
			connInfo = "USB/Windows"
		}
		fmt.Printf("   %s %s (%s) - %s\n", status, p.Name, connInfo, p.Location)
	}
	fmt.Println()
}

func getPrinter(job PrintJob) Printer {
	if p, ok := printerCache[job.PrinterID]; ok {
		return p
	}
	return Printer{
		ID:   job.PrinterID,
		Name: job.PrinterName,
		IP:   job.PrinterIP,
		Port: job.PrinterPort,
		Type: job.PrinterType,
	}
}

func reportJobResult(config *Config, jobID int, status, errorMsg string) {
	client := &http.Client{Timeout: 10 * time.Second}

	result := JobResultRequest{
		JobID:        jobID,
		Status:       status,
		ErrorMessage: errorMsg,
	}

	jsonData, _ := json.Marshal(result)

	req, err := http.NewRequest("POST", config.ServerURL+"/api/agent/jobs/result", bytes.NewBuffer(jsonData))
	if err != nil {
		return
	}

	req.Header.Set("Authorization", "Bearer "+config.AgentToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return
	}
	resp.Body.Close()
}

func printToNetworkPrinter(ip string, port int, job PrintJob) error {
	if ip == "" {
		return fmt.Errorf("IP da impressora não configurado")
	}

	addr := fmt.Sprintf("%s:%d", ip, port)
	conn, err := net.DialTimeout("tcp", addr, 5*time.Second)
	if err != nil {
		return fmt.Errorf("não conectou em %s: %v", addr, err)
	}
	defer conn.Close()

	var data []byte
	if job.Data != "" {
		data, err = base64.StdEncoding.DecodeString(job.Data)
		if err != nil {
			data = generateESCPOS(job)
		}
	} else {
		data = generateESCPOS(job)
	}

	_, err = conn.Write(data)
	if err != nil {
		return fmt.Errorf("erro ao enviar: %v", err)
	}

	return nil
}

func printToWindowsPrinter(printerName string, job PrintJob) error {
	if runtime.GOOS != "windows" {
		return fmt.Errorf("não é Windows")
	}

	printerNamePtr, err := syscall.UTF16PtrFromString(printerName)
	if err != nil {
		return err
	}

	var hPrinter uintptr
	ret, _, err := procOpenPrinterW.Call(
		uintptr(unsafe.Pointer(printerNamePtr)),
		uintptr(unsafe.Pointer(&hPrinter)),
		0,
	)
	if ret == 0 {
		return fmt.Errorf("impressora '%s' não encontrada", printerName)
	}
	defer procClosePrinter.Call(hPrinter)

	docName, _ := syscall.UTF16PtrFromString(fmt.Sprintf("ComideX #%d", job.ID))
	datatype, _ := syscall.UTF16PtrFromString("RAW")

	docInfo := DOC_INFO_1{
		DocName:    docName,
		OutputFile: nil,
		Datatype:   datatype,
	}

	ret, _, _ = procStartDocPrinterW.Call(hPrinter, 1, uintptr(unsafe.Pointer(&docInfo)))
	if ret == 0 {
		return fmt.Errorf("erro ao iniciar documento")
	}
	defer procEndDocPrinter.Call(hPrinter)

	ret, _, _ = procStartPagePrinter.Call(hPrinter)
	if ret == 0 {
		return fmt.Errorf("erro ao iniciar página")
	}
	defer procEndPagePrinter.Call(hPrinter)

	var data []byte
	if job.Data != "" {
		data, err = base64.StdEncoding.DecodeString(job.Data)
		if err != nil {
			data = generateESCPOS(job)
		}
	} else {
		data = generateESCPOS(job)
	}

	var written uint32
	ret, _, _ = procWritePrinter.Call(
		hPrinter,
		uintptr(unsafe.Pointer(&data[0])),
		uintptr(len(data)),
		uintptr(unsafe.Pointer(&written)),
	)
	if ret == 0 {
		return fmt.Errorf("erro ao escrever dados")
	}

	return nil
}

func printToLPR(printerName string, job PrintJob) error {
	var data []byte
	var err error
	
	if job.Data != "" {
		data, err = base64.StdEncoding.DecodeString(job.Data)
		if err != nil {
			data = generateESCPOS(job)
		}
	} else {
		data = generateESCPOS(job)
	}

	cmd := exec.Command("lpr", "-P", printerName)
	cmd.Stdin = bytes.NewReader(data)
	return cmd.Run()
}

func generateESCPOS(job PrintJob) []byte {
	var buf bytes.Buffer

	buf.Write([]byte{0x1B, 0x40})
	buf.Write([]byte{0x1B, 0x61, 0x01})
	buf.Write([]byte{0x1B, 0x21, 0x30})
	buf.WriteString("PEDIDO COZINHA\n")
	buf.Write([]byte{0x1B, 0x21, 0x00})
	buf.Write([]byte{0x0A})
	buf.Write([]byte{0x1B, 0x61, 0x00})
	buf.Write([]byte{0x1B, 0x45, 0x01})
	buf.WriteString(fmt.Sprintf("MESA: %s\n", job.TableName))
	buf.Write([]byte{0x1B, 0x45, 0x00})
	buf.WriteString(fmt.Sprintf("Pedido #%d\n", job.OrderID))
	buf.WriteString(fmt.Sprintf("%s\n", time.Now().Format("02/01/2006 15:04:05")))
	buf.Write([]byte{0x0A})
	buf.WriteString("================================\n")
	buf.Write([]byte{0x1B, 0x21, 0x10})
	buf.Write([]byte{0x1B, 0x45, 0x01})
	buf.WriteString(fmt.Sprintf("%dx %s\n", job.Quantity, job.ItemName))
	buf.Write([]byte{0x1B, 0x45, 0x00})
	buf.Write([]byte{0x1B, 0x21, 0x00})

	if job.Notes != "" {
		buf.Write([]byte{0x0A})
		buf.WriteString(fmt.Sprintf("OBS: %s\n", job.Notes))
	}

	buf.Write([]byte{0x0A})
	buf.WriteString("================================\n")
	buf.Write([]byte{0x0A, 0x0A})
	buf.Write([]byte{0x1B, 0x42, 0x03, 0x01})
	buf.Write([]byte{0x1D, 0x56, 0x41, 0x03})

	return buf.Bytes()
}
