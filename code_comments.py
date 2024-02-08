import os
import re

def count_code_and_comments(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        code_lines = 0
        comment_lines = 0
        doc_lines = 0
        in_comment_block = False

        for line in file:
            line = line.strip()

            if line.startswith('/*'):
                in_comment_block = True
                comment_lines += 1
            elif line.startswith('*/'):
                in_comment_block = False
                comment_lines += 1
            elif line.startswith('//') or in_comment_block:
                comment_lines += 1
            elif re.match(r'^\s*$', line):  # Skip empty lines
                continue
            elif re.match(r'^\s*\*', line):  # Documentation lines
                doc_lines += 1
            else:
                code_lines += 1

    return code_lines, comment_lines, doc_lines

def analyze_folder():
    folder_path = "src"
    total_code_lines = 0
    total_comment_lines = 0
    total_doc_lines = 0

    for root, dirs, files in os.walk(folder_path):
        for file_name in files:
            if file_name.endswith('.js') or file_name.endswith('.jsx'):
                file_path = os.path.join(root, file_name)
                code_lines, comment_lines, doc_lines = count_code_and_comments(file_path)
                total_code_lines += code_lines
                total_comment_lines += comment_lines
                total_doc_lines += doc_lines

    total_lines = total_code_lines + total_comment_lines + total_doc_lines

    return total_code_lines, total_comment_lines, total_doc_lines, total_lines

def main():
    code_lines, comment_lines, doc_lines, total_lines = analyze_folder()

    code_percent = (code_lines / total_lines) * 100
    comment_percent = (comment_lines / total_lines) * 100
    doc_percent = (doc_lines / total_lines) * 100

    print("\nStatistik für den Ordner 'src':")
    print("Gesamtanzahl Zeilen: ", total_lines)
    print("Codezeilen: ", code_lines, f"({code_percent:.2f}%)")
    print("Kommentarzeilen: ", comment_lines, f"({comment_percent:.2f}%)")
    print("Dokumentationszeilen: ", doc_lines, f"({doc_percent:.2f}%)")

if __name__ == "__main__":
    main()
