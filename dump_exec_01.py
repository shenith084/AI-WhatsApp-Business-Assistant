import sqlite3, json, sys

conn = sqlite3.connect('temp.sqlite')
cursor = conn.cursor()
try:
    cursor.execute("SELECT id, startedAt FROM execution_entity WHERE workflowId = 'Yc06YJ1b81bDAwhy' ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    if row:
        exec_id = row[0]
        print(f"Exec {exec_id} at {row[1]}")
        cursor.execute("SELECT data FROM execution_data WHERE executionId = ?", (exec_id,))
        data_row = cursor.fetchone()
        if data_row and data_row[0]:
            with open('exec_01_latest.json', 'w', encoding='utf-8') as f:
                f.write(data_row[0])
            print("Wrote exec_01_latest.json")
except Exception as e:
    print(e)

