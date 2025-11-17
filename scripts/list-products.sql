-- Lista todos os produtos únicos dos grupos de Rodízio
SELECT DISTINCT ON (LOWER(TRIM(i.name)))
  i.id,
  i.name,
  g.name as grupo
FROM items i
JOIN groups g ON i.group_id = g.id
WHERE g.name ILIKE '%rodizio%' 
  OR g.name ILIKE '%tradicional%' 
  OR g.name ILIKE '%premium%'
ORDER BY LOWER(TRIM(i.name)), i.id;
