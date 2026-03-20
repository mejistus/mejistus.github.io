#!/usr/bin/env python3
"""CLI 工具：添加新博客文章到 list.json 头部"""

import json
import re
import sys
from datetime import datetime
from pathlib import Path

# 目录名到标签的映射
DIR_TO_TAG = {
    'RL': 'RL',
    'Diffusion': 'Diffusion',
    'ML': 'ML',
    'Math': 'Math',
    'Cybernetics': 'Cybernetics',
    'Information Theory': 'InfoTheory',
    'Blogs': 'Notes',
}


def parse_front_matter(content: str) -> dict:
    """解析 YAML front matter（--- 包裹的部分）"""
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if not match:
        return {}
    
    fm_text = match.group(1)
    metadata = {}
    
    for line in fm_text.strip().split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            metadata[key.strip()] = value.strip()
    
    return metadata


def extract_title(content: str, front_matter: dict = None) -> str:
    """从 markdown 内容提取标题（优先 front matter，其次第一个 # 标题）"""
    if front_matter and 'title' in front_matter:
        return front_matter['title']
    
    match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    if match:
        return match.group(1).strip()
    return Path(content).stem


def extract_excerpt(content: str, front_matter: dict = None) -> str:
    """从 front matter 或内容提取摘要"""
    # 优先使用 front matter 中的 excerpt
    if front_matter and 'excerpt' in front_matter:
        return front_matter['excerpt']
    
    # 否则从内容提取（跳过 front matter）
    content_no_fm = re.sub(r'^---\s*\n.*?\n---\s*\n', '', content, flags=re.DOTALL)
    
    lines = content_no_fm.split('\n')
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith('#'):
            continue
        # 移除 markdown 格式，保留纯文本
        text = re.sub(r'\*\*(.+?)\*\*', r'\1', stripped)
        text = re.sub(r'\*(.+?)\*', r'\1', text)
        text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
        text = re.sub(r'<[^>]+>', '', text)
        text = re.sub(r'\$\$?.*?\$\$?', '', text)
        if text:
            return text[:100] + '...' if len(text) > 100 else text
    return ''


def extract_tag_from_comment(content: str) -> str:
    """从 HTML 注释提取标签 <!-- tag: xxx -->"""
    match = re.search(r'<!--\s*tag\s*:\s*(\w+)\s*-->', content, re.IGNORECASE)
    if match:
        return match.group(1)
    return None


def guess_tag_from_path(md_path: Path) -> str:
    """根据文件路径推断标签"""
    parent_name = md_path.parent.name
    return DIR_TO_TAG.get(parent_name, 'Notes')


def get_tag(content: str, front_matter: dict, md_path: Path, explicit_tag: str = None) -> str:
    """获取标签：命令行 > front matter > HTML 注释 > 路径推断"""
    if explicit_tag:
        return explicit_tag
    if front_matter and 'tag' in front_matter:
        return front_matter['tag']
    comment_tag = extract_tag_from_comment(content)
    if comment_tag:
        return comment_tag
    return guess_tag_from_path(md_path)


def add_blog(md_file: str, date_str: str = None, tag: str = None, excerpt: str = None, dry_run: bool = False):
    """添加博客到 list.json"""
    md_path = Path(md_file)
    if not md_path.exists():
        print(f"错误：文件不存在：{md_file}", file=sys.stderr)
        sys.exit(1)
    
    if not md_path.suffix.lower() == '.md':
        print(f"错误：必须是 .md 文件：{md_file}", file=sys.stderr)
        sys.exit(1)
    
    content = md_path.read_text(encoding='utf-8')
    front_matter = parse_front_matter(content)
    
    title = extract_title(content, front_matter)
    
    # 使用命令行指定的 excerpt，否则从 front matter 或内容提取
    if excerpt:
        final_excerpt = excerpt
    else:
        final_excerpt = extract_excerpt(content, front_matter)
    
    final_tag = get_tag(content, front_matter, md_path, tag)
    
    if date_str is None:
        if front_matter and 'date' in front_matter:
            date_str = front_matter['date']
        else:
            date_str = f"{datetime.now().year} · Notes"
    
    entry = {
        "file": md_path.name,
        "title": title,
        "date": date_str,
        "tag": final_tag,
        "excerpt": final_excerpt
    }
    
    # 查找根目录的 list.json
    root_dir = md_path.parent
    while not (root_dir / 'list.json').exists() and root_dir.parent != root_dir:
        root_dir = root_dir.parent
    list_json_path = root_dir / 'list.json'
    
    # 计算相对路径
    rel_path = md_path.relative_to(list_json_path.parent) if md_path.is_relative_to(list_json_path.parent) else md_path.name
    
    if list_json_path.exists():
        with open(list_json_path, 'r', encoding='utf-8') as f:
            entries = json.load(f)
    else:
        entries = []
    
    # 检查是否已存在
    for i, e in enumerate(entries):
        if e.get('file') == str(rel_path):
            print(f"更新已有条目：{rel_path}")
            entries[i] = entry
            break
    else:
        print(f"添加新条目：{rel_path}")
        entries.insert(0, entry)
    
    if dry_run:
        print("\n预览结果:")
        print(json.dumps(entry, ensure_ascii=False, indent=2))
        return
    
    with open(list_json_path, 'w', encoding='utf-8') as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)
        f.write('\n')
    
    print(f"已更新：{list_json_path}")


def sync_all(dry_run: bool = False):
    """同步所有 markdown 文件到 list.json"""
    script_dir = Path(__file__).parent
    list_json_path = script_dir / 'list.json'
    
    md_files = []
    for pattern in ['*.md', '*/*.md']:
        md_files.extend(script_dir.glob(pattern))
    
    md_files = [f for f in md_files if f.name != 'README.md']
    md_files = sorted(md_files, key=lambda p: p.stat().st_mtime, reverse=True)
    
    if list_json_path.exists():
        with open(list_json_path, 'r', encoding='utf-8') as f:
            existing = json.load(f)
        existing_files = {e.get('file') for e in existing}
    else:
        existing_files = set()
    
    new_entries = []
    for md_file in md_files:
        rel_path = md_file.relative_to(script_dir) if md_file.is_relative_to(script_dir) else md_file.name
        if str(rel_path) not in existing_files:
            content = md_file.read_text(encoding='utf-8')
            front_matter = parse_front_matter(content)
            title = extract_title(content, front_matter)
            excerpt = extract_excerpt(content, front_matter)
            tag = get_tag(content, front_matter, md_file)
            date_str = front_matter.get('date', f"{datetime.now().year} · Notes")
            new_entries.append({
                "file": str(rel_path),
                "title": title,
                "date": date_str,
                "tag": tag,
                "excerpt": excerpt
            })
    
    if not new_entries:
        print("没有新文件需要同步")
        return
    
    print(f"发现 {len(new_entries)} 个新文件:")
    for e in new_entries:
        print(f"  - {e['file']}")
    
    if dry_run:
        return
    
    if list_json_path.exists():
        with open(list_json_path, 'r', encoding='utf-8') as f:
            entries = json.load(f)
    else:
        entries = []
    
    entries.extend(new_entries)
    
    with open(list_json_path, 'w', encoding='utf-8') as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)
        f.write('\n')
    
    print(f"已更新：{list_json_path}")


def rebuild_all(dry_run: bool = False):
    """重建整个 list.json（覆盖现有内容）"""
    script_dir = Path(__file__).parent
    list_json_path = script_dir / 'list.json'
    
    md_files = []
    for pattern in ['*.md', '*/*.md']:
        md_files.extend(script_dir.glob(pattern))
    
    md_files = [f for f in md_files if f.name != 'README.md']
    md_files = sorted(md_files, key=lambda p: p.stat().st_mtime, reverse=True)
    
    entries = []
    for md_file in md_files:
        content = md_file.read_text(encoding='utf-8')
        front_matter = parse_front_matter(content)
        title = extract_title(content, front_matter)
        excerpt = extract_excerpt(content, front_matter)
        tag = get_tag(content, front_matter, md_file)
        date_str = front_matter.get('date', f"{datetime.now().year} · Notes")
        entries.append({
            "file": md_file.name,
            "title": title,
            "date": date_str,
            "tag": tag,
            "excerpt": excerpt
        })
    
    print(f"共找到 {len(entries)} 篇文章")
    
    if dry_run:
        print("\n预览结果:")
        print(json.dumps(entries, ensure_ascii=False, indent=2))
        return
    
    with open(list_json_path, 'w', encoding='utf-8') as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)
        f.write('\n')
    
    print(f"已更新：{list_json_path}")


def main():
    import argparse
    parser = argparse.ArgumentParser(description='添加博客文章到 list.json')
    parser.add_argument('file', nargs='?', help='markdown 文件路径')
    parser.add_argument('-d', '--date', help='日期字符串，如 "2025 · Research"')
    parser.add_argument('-t', '--tag', help='标签，如 "Research"')
    parser.add_argument('-e', '--excerpt', help='摘要内容（可选，覆盖自动提取）')
    parser.add_argument('-n', '--dry-run', action='store_true', help='预览模式，不写入文件')
    parser.add_argument('--sync-all', action='store_true', help='同步所有未收录的 markdown 文件')
    parser.add_argument('--rebuild', action='store_true', help='重建整个 list.json（覆盖现有内容）')
    
    args = parser.parse_args()
    
    if args.rebuild:
        rebuild_all(dry_run=args.dry_run)
    elif args.sync_all:
        sync_all(dry_run=args.dry_run)
    elif args.file:
        add_blog(args.file, args.date, args.tag, args.excerpt, args.dry_run)
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
