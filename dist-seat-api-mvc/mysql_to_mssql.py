import re

def convert_to_tsql(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Eliminar comentarios MySQL
    content = re.sub(r'/\*!.*?\*/;', '', content)
    content = re.sub(r'--.*\n', '', content)
    content = re.sub(r'LOCK TABLES.*\n', '', content)
    content = re.sub(r'UNLOCK TABLES;\n', '', content)
    content = re.sub(r'DROP TABLE IF EXISTS `(.*?)`;', r"IF OBJECT_ID('\1', 'U') IS NOT NULL DROP TABLE \1;", content)

    # Convertir definiciones de tablas
    create_table_blocks = re.findall(r'CREATE TABLE `(.*?)` \((.*?)\) ENGINE=.*?;', content, re.DOTALL)
    
    tsql_content = "CREATE DATABASE mi_api_db;\nGO\nUSE mi_api_db;\nGO\n\n"
    
    for table_name, block in create_table_blocks:
        print(f"Buscando tabla {table_name}")
        # Limpiar backticks y collation
        block = block.replace('`', '')
        block = re.sub(r' COLLATE [a-zA-Z0-9_]+', '', block)
        block = re.sub(r' CHARACTER SET [a-zA-Z0-9_]+', '', block)
        
        # Convertir tipos
        block = re.sub(r'int\(\d+\)', 'INT', block)
        block = re.sub(r'int NOT NULL AUTO_INCREMENT', 'INT IDENTITY(1,1) NOT NULL', block)
        block = re.sub(r'bigint unsigned NOT NULL AUTO_INCREMENT', 'BIGINT IDENTITY(1,1) NOT NULL', block)
        block = re.sub(r'tinyint\(1\)', 'BIT', block)
        block = re.sub(r'json', 'NVARCHAR(MAX)', block)
        block = re.sub(r'text', 'NVARCHAR(MAX)', block)
        block = re.sub(r'timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'DATETIME2 DEFAULT GETDATE()', block)
        block = re.sub(r'timestamp NULL DEFAULT CURRENT_TIMESTAMP', 'DATETIME2 DEFAULT GETDATE()', block)
        block = re.sub(r'datetime DEFAULT CURRENT_TIMESTAMP', 'DATETIME2 DEFAULT GETDATE()', block)
        block = re.sub(r'datetime DEFAULT NULL', 'DATETIME2 DEFAULT NULL', block)
        block = re.sub(r'timestamp DEFAULT NULL', 'DATETIME2 DEFAULT NULL', block)
        
        # Convertir foreign keys limpiando constrain definition para simplificar y sacar keys
        lines = block.split('\n')
        new_lines = []
        for line in lines:
            line = line.strip()
            if not line: continue
            
            if line.startswith('UNIQUE KEY'):
                # Extract columns
                match = re.search(r'UNIQUE KEY.*?(\(.*?\))', line)
                if match:
                    new_lines.append(f"UNIQUE {match.group(1)},")
            elif line.startswith('KEY'):
                continue # Skip non-unique indexes for now to avoid syntax issues inline
            elif line.startswith('CONSTRAINT'):
                # T-SQL constraint: CONSTRAINT x FOREIGN KEY (y) REFERENCES z (w)
                line = line.replace(' ON DELETE SET NULL', '')
                line = line.replace(' ON UPDATE CASCADE', '')
                new_lines.append(line)
            else:
                new_lines.append(line)

        # Cleanup trailing commas in the block
        joined_block = '\n  '.join(new_lines)
        if joined_block.endswith(','):
            joined_block = joined_block[:-1]
            
        tsql_content += f"CREATE TABLE {table_name} (\n  {joined_block}\n);\nGO\n\n"

    # Convertir inserts, y hacer chunks de 1000
    insert_blocks = re.findall(r'INSERT INTO `(.*?)` VALUES (.*?);', content, re.DOTALL)
    
    tables_to_keep_data = ['roles', 'usuarios', 'marcas', 'distribuidoras', 'ips_autorizadas']
    
    for table_name, values_str in insert_blocks:
        if table_name not in tables_to_keep_data:
            continue
            
        # Parse the values string into individual tuples. Replace backticks
        # Regex to split out tuples like (1, 'foo', ...), (2, 'bar', ...)
        # This regex is a simple split by '),' and re-appending ')'
        tuples = values_str.split('),(')
        
        chunk_size = 900
        tsql_content += f"SET IDENTITY_INSERT {table_name} ON;\nGO\n"
        for i in range(0, len(tuples), chunk_size):
            chunk = tuples[i:i+chunk_size]
            
            # Reconstruct tuples and replace \' if any?
            for j in range(len(chunk)):
                curr = chunk[j]
                if i == 0 and j == 0 and curr.startswith('('):
                    curr = curr[1:]
                if i + chunk_size > len(tuples) and j + 1 == len(chunk) and curr.endswith(')'):
                    curr = curr[:-1]
                
                chunk[j] = f"({curr})"
            
            val_chunk = ','.join(chunk)
            tsql_content += f"INSERT INTO {table_name} VALUES {val_chunk};\nGO\n"
            
        tsql_content += f"SET IDENTITY_INSERT {table_name} OFF;\nGO\n\n"
        
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(tsql_content)

convert_to_tsql('db-init/init.sql', 'db-init/init_sqlserver.sql')
