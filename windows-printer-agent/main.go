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
	VERSION       = "1.0.0"
	CONFIG_FILE   = "comidex-printer.json"
	POLL_INTERVAL = 3 * time.Second
)

type Config struct {
	ServerURL   string `json:"server_url"`
	AgentToken  string `json:"agent_token"`
	AgentName   string `json:"agent_name"`
	PrinterName string `json:"printer_name"`
	PrinterType string `json:"printer_type"` // "windows" or "network"
	PrinterIP   string `json:"printer_ip"`   // For network printers
	PrinterPort int    `json:"printer_port"` // Default 9100
}

type PrintJob struct {
	ID           int    `json:"id"`
	PrinterID    int    `json:"printer_id"`
	DocumentType string `json:"document_type"`
	Status       string `json:"status"`
	Data         string `json:"data"` // Base64 encoded ESC/POS
	TableName    string `json:"table_name"`
	ItemName     string `json:"item_name"`
	Quantity     int    `json:"quantity"`
	Notes        string `json:"notes"`
	OrderID      int    `json:"order_id"`
	CreatedAt    string `json:"created_at"`
}

type JobsResponse struct {
	Success bool       `json:"success"`
	Jobs    []PrintJob `json:"jobs"`
}

type JobResultRequest struct {
	JobID        int    `json:"job_id"`
	Status       string `json:"status"`
	ErrorMessage string `json:"error_message,omitempty"`
}

var (
	modwinspool            = syscall.NewLazyDLL("winspool.drv")
	procOpenPrinterW       = modwinspool.NewProc("OpenPrinterW")
	procClosePrinter       = modwinspool.NewProc("ClosePrinter")
	procStartDocPrinterW   = modwinspool.NewProc("StartDocPrinterW")
	procEndDocPrinter      = modwinspool.NewProc("EndDocPrinter")
	procStartPagePrinter   = modwinspool.NewProc("StartPagePrinter")
	procEndPagePrinter     = modwinspool.NewProc("EndPagePrinter")
	procWritePrinter       = modwinspool.NewProc("WritePrinter")
	procEnumPrintersW      = modwinspool.NewProc("EnumPrintersW")
)

type DOC_INFO_1 struct {
	DocName    *uint16
	OutputFile *uint16
	Datatype   *uint16
}

func main() {
	fmt.Println("╔══════════════════════════════════════════════════════╗")
	fmt.Println("║       ComideX Printer Agent v" + VERSION + "                  ║")
	fmt.Println("║       Conectando impressora local ao sistema         ║")
	fmt.Println("╚══════════════════════════════════════════════════════╝")
	fmt.Println()

	config, err := loadOrCreateConfig()
	if err != nil {
		log.Fatalf("Erro ao carregar configuração: %v", err)
	}

	fmt.Printf("📡 Servidor: %s\n", config.ServerURL)
	fmt.Printf("🖨️  Impressora: %s (%s)\n", config.PrinterName, config.PrinterType)
	fmt.Printf("🔄 Intervalo de polling: %v\n\n", POLL_INTERVAL)

	if config.PrinterType == "windows" && runtime.GOOS == "windows" {
		testWindowsPrinter(config.PrinterName)
	}

	fmt.Println("✅ Agente iniciado! Aguardando jobs de impressão...")
	fmt.Println("   Pressione Ctrl+C para sair\n")

	for {
		processJobs(config)
		time.Sleep(POLL_INTERVAL)
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
		fmt.Println("⚙️  Configuração não encontrada. Vamos criar uma nova!")
		fmt.Println()

		config := &Config{
			PrinterPort: 9100,
		}

		fmt.Print("URL do servidor Replit (ex: https://seu-app.replit.app): ")
		fmt.Scanln(&config.ServerURL)
		config.ServerURL = strings.TrimSpace(config.ServerURL)
		config.ServerURL = strings.TrimSuffix(config.ServerURL, "/")

		fmt.Print("Token do agente (fornecido pelo admin): ")
		fmt.Scanln(&config.AgentToken)
		config.AgentToken = strings.TrimSpace(config.AgentToken)

		fmt.Print("Nome deste agente (ex: Cozinha-PC): ")
		fmt.Scanln(&config.AgentName)
		config.AgentName = strings.TrimSpace(config.AgentName)

		fmt.Println("\nTipo de impressora:")
		fmt.Println("  1. Impressora Windows (USB ou compartilhada)")
		fmt.Println("  2. Impressora de rede (IP direto)")
		fmt.Print("Escolha (1 ou 2): ")
		var choice string
		fmt.Scanln(&choice)

		if choice == "2" {
			config.PrinterType = "network"
			fmt.Print("IP da impressora: ")
			fmt.Scanln(&config.PrinterIP)
			config.PrinterIP = strings.TrimSpace(config.PrinterIP)
			fmt.Print("Porta (enter para 9100): ")
			var portStr string
			fmt.Scanln(&portStr)
			if portStr != "" {
				fmt.Sscanf(portStr, "%d", &config.PrinterPort)
			}
		} else {
			config.PrinterType = "windows"
			if runtime.GOOS == "windows" {
				printers := listWindowsPrinters()
				if len(printers) > 0 {
					fmt.Println("\nImpressoras disponíveis:")
					for i, p := range printers {
						fmt.Printf("  %d. %s\n", i+1, p)
					}
					fmt.Print("Escolha o número ou digite o nome: ")
					var printerChoice string
					fmt.Scanln(&printerChoice)
					var idx int
					if _, err := fmt.Sscanf(printerChoice, "%d", &idx); err == nil && idx > 0 && idx <= len(printers) {
						config.PrinterName = printers[idx-1]
					} else {
						config.PrinterName = strings.TrimSpace(printerChoice)
					}
				} else {
					fmt.Print("Nome da impressora: ")
					fmt.Scanln(&config.PrinterName)
					config.PrinterName = strings.TrimSpace(config.PrinterName)
				}
			} else {
				fmt.Print("Nome da impressora: ")
				fmt.Scanln(&config.PrinterName)
				config.PrinterName = strings.TrimSpace(config.PrinterName)
			}
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

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("❌ Erro ao conectar ao servidor: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("❌ Erro do servidor (%d): %s", resp.StatusCode, string(body))
		return
	}

	var jobsResp JobsResponse
	if err := json.NewDecoder(resp.Body).Decode(&jobsResp); err != nil {
		log.Printf("Erro ao decodificar resposta: %v", err)
		return
	}

	if !jobsResp.Success {
		return
	}

	for _, job := range jobsResp.Jobs {
		fmt.Printf("📄 Job #%d: %s (Mesa: %s)\n", job.ID, job.ItemName, job.TableName)

		var printErr error
		if config.PrinterType == "network" {
			printErr = printToNetworkPrinter(config.PrinterIP, config.PrinterPort, job)
		} else if runtime.GOOS == "windows" {
			printErr = printToWindowsPrinter(config.PrinterName, job)
		} else {
			printErr = printToLPR(config.PrinterName, job)
		}

		status := "printed"
		errorMsg := ""
		if printErr != nil {
			status = "failed"
			errorMsg = printErr.Error()
			fmt.Printf("   ❌ Falha: %v\n", printErr)
		} else {
			fmt.Println("   ✅ Impresso com sucesso!")
		}

		reportJobResult(config, job.ID, status, errorMsg)
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
		log.Printf("Erro ao criar request de resultado: %v", err)
		return
	}

	req.Header.Set("Authorization", "Bearer "+config.AgentToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Erro ao reportar resultado: %v", err)
		return
	}
	defer resp.Body.Close()
}

func printToNetworkPrinter(ip string, port int, job PrintJob) error {
	addr := fmt.Sprintf("%s:%d", ip, port)
	conn, err := net.DialTimeout("tcp", addr, 5*time.Second)
	if err != nil {
		return fmt.Errorf("não foi possível conectar à impressora: %v", err)
	}
	defer conn.Close()

	data, err := base64.StdEncoding.DecodeString(job.Data)
	if err != nil {
		data = generateESCPOS(job)
	}

	_, err = conn.Write(data)
	if err != nil {
		return fmt.Errorf("erro ao enviar dados: %v", err)
	}

	return nil
}

func printToWindowsPrinter(printerName string, job PrintJob) error {
	if runtime.GOOS != "windows" {
		return fmt.Errorf("impressão Windows não suportada neste SO")
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
		return fmt.Errorf("não foi possível abrir a impressora: %v", err)
	}
	defer procClosePrinter.Call(hPrinter)

	docName, _ := syscall.UTF16PtrFromString(fmt.Sprintf("ComideX Job #%d", job.ID))
	datatype, _ := syscall.UTF16PtrFromString("RAW")

	docInfo := DOC_INFO_1{
		DocName:    docName,
		OutputFile: nil,
		Datatype:   datatype,
	}

	ret, _, err = procStartDocPrinterW.Call(
		hPrinter,
		1,
		uintptr(unsafe.Pointer(&docInfo)),
	)
	if ret == 0 {
		return fmt.Errorf("não foi possível iniciar documento: %v", err)
	}
	defer procEndDocPrinter.Call(hPrinter)

	ret, _, _ = procStartPagePrinter.Call(hPrinter)
	if ret == 0 {
		return fmt.Errorf("não foi possível iniciar página")
	}
	defer procEndPagePrinter.Call(hPrinter)

	data, err := base64.StdEncoding.DecodeString(job.Data)
	if err != nil {
		data = generateESCPOS(job)
	}

	var written uint32
	ret, _, err = procWritePrinter.Call(
		hPrinter,
		uintptr(unsafe.Pointer(&data[0])),
		uintptr(len(data)),
		uintptr(unsafe.Pointer(&written)),
	)
	if ret == 0 {
		return fmt.Errorf("erro ao escrever dados: %v", err)
	}

	return nil
}

func printToLPR(printerName string, job PrintJob) error {
	data, err := base64.StdEncoding.DecodeString(job.Data)
	if err != nil {
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

func listWindowsPrinters() []string {
	if runtime.GOOS != "windows" {
		return nil
	}

	var printers []string

	cmd := exec.Command("wmic", "printer", "get", "name")
	output, err := cmd.Output()
	if err != nil {
		return printers
	}

	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line != "" && line != "Name" {
			printers = append(printers, line)
		}
	}

	return printers
}

func testWindowsPrinter(printerName string) {
	printerNamePtr, err := syscall.UTF16PtrFromString(printerName)
	if err != nil {
		fmt.Printf("⚠️  Aviso: Nome da impressora inválido: %v\n", err)
		return
	}

	var hPrinter uintptr
	ret, _, _ := procOpenPrinterW.Call(
		uintptr(unsafe.Pointer(printerNamePtr)),
		uintptr(unsafe.Pointer(&hPrinter)),
		0,
	)
	if ret == 0 {
		fmt.Printf("⚠️  Aviso: Impressora '%s' não encontrada ou inacessível\n", printerName)
		fmt.Println("   Verifique se o nome está correto e a impressora está instalada.")
		return
	}
	procClosePrinter.Call(hPrinter)
	fmt.Printf("✅ Impressora '%s' encontrada e acessível\n", printerName)
}
