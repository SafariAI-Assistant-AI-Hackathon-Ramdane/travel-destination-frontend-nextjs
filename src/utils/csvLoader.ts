export const parseCSV = (csvText: string) => {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split(',').map(h => {
    let header = h.trim();
    if (header.startsWith('"') && header.endsWith('"')) {
      header = header.substring(1, header.length - 1);
    }
    return header;
  });
  
  return lines.slice(1).map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote: "" -> literal "
                current += '"';
                i++; // skip next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(current); // Don't trim here yet, preserve spaces inside quotes
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current);

    const entry: any = {};
    headers.forEach((header, index) => {
      let val = values[index] || '';
      val = val.trim();
      // If the value was quoted, strip the outer quotes.
      // Note: Our logic above accumulated contents *including* specific escaped quotes if we treated them as literals.
      // Actually, standard CSV parsers usually keep strict content. 
      // But purely manual parsing: if we didn't add the *outer* quotes to `current`, we are good.
      // BUT my logic above: `if (char === '"') ... inQuotes = !inQuotes` -> this means I *am* skipping the quote character itself? 
      // No, `current += char` is in the `else` block. So explicit quotes `"` are NOT added to `current` when they toggle state?
      // Wait, let's look closely at the loop proposed.
      
      // Correct Logic for loop:
      // if char is " and next is ": add " to current, skip next.
      // if char is ": toggle inQuotes.
      // else: add char.
      
      // With this logic, the SURROUNDING quotes are skipped (because they hit `inQuotes = !inQuotes` and don't go to `current += char`).
      // So `val` is already clean of surrounding quotes! 
      // AND escaped quotes `""` became `"` in `current`.
      // So no need to strip quotes again.
      
      entry[header] = val;
    });
    return entry;
  });
};
