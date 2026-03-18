#!/usr/bin/env python3
"""YC Launch (Y Combinator) crawler via HTML scraping. Zero external dependencies.
Usage: python3 search-yc-launch.py "<keywords>" [limit]
Output: JSON CrawlResult to stdout
"""

import json
import re
import sys
import urllib.request
import urllib.parse
from datetime import datetime, timezone


def safe_fetch(url, timeout=10):
    """Fetch URL with timeout and user-agent header."""
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    })
    return urllib.request.urlopen(req, timeout=timeout).read().decode("utf-8", errors="replace")


def truncate(text, max_len=500):
    return text[:max_len] + "..." if len(text) > max_len else text


def extract_launch_urls(html):
    """Extract launch URLs from YC launches page."""
    urls = []
    seen = set()
    for match in re.finditer(r'href="(/launches/[^"?#]+)"', html):
        path = match.group(1)
        if path not in seen:
            seen.add(path)
            urls.append(f"https://www.ycombinator.com{path}")
    return urls


def extract_launch_from_page(html, url):
    """Extract launch details from a YC launch page."""
    # Try JSON-LD
    ld_match = re.search(
        r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',
        html, re.DOTALL
    )
    name = ""
    description = ""

    if ld_match:
        try:
            data = json.loads(ld_match.group(1))
            name = data.get("name", "")
            description = data.get("description", "")
        except (json.JSONDecodeError, ValueError):
            pass

    # Fallback: meta tags
    if not name:
        m = re.search(r'<meta\s+property="og:title"\s+content="([^"]*)"', html)
        if m:
            name = m.group(1).replace(" | Y Combinator", "").replace("Launch YC: ", "")

    if not description:
        m = re.search(r'<meta\s+property="og:description"\s+content="([^"]*)"', html)
        if not m:
            m = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', html)
        if m:
            description = m.group(1)

    if not name:
        # Try h1 tag
        m = re.search(r'<h1[^>]*>([^<]+)</h1>', html)
        if m:
            name = m.group(1).strip()

    if not name:
        return None

    # Try to extract longer pitch from page body
    pitch = ""
    # Look for main content paragraphs
    for m in re.finditer(r'<p[^>]*>([^<]{50,})</p>', html):
        candidate = m.group(1).strip()
        if len(candidate) > len(pitch):
            pitch = candidate

    return {
        "name": name,
        "url": url,
        "description": truncate(pitch or description),
        "tagline": description[:150] if len(description) < 150 else None,
        "rating": None,
        "reviewCount": None,
        "pricing": {"free": True, "other": None},
        "features": [],
        "reviews": [],
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python3 search-yc-launch.py <keywords> [limit]"}))
        sys.exit(1)

    query = sys.argv[1]
    limit = 5
    if len(sys.argv) >= 3:
        try:
            limit = max(1, min(int(sys.argv[2]), 10))
        except ValueError:
            limit = 5

    errors = []
    search_url = f"https://www.ycombinator.com/launches?q={urllib.parse.quote(query)}"

    try:
        search_html = safe_fetch(search_url)
    except Exception as e:
        print(json.dumps({
            "platform": "yc_launch", "query": query,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "results": [], "errors": [f"YC launches error: {e}"],
        }, indent=2))
        return

    launch_urls = extract_launch_urls(search_html)[:limit]

    if not launch_urls:
        errors.append("No launch URLs found — page may require JS rendering")
        print(json.dumps({
            "platform": "yc_launch", "query": query,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "results": [], "errors": errors,
        }, indent=2))
        return

    results = []
    for url in launch_urls:
        try:
            page_html = safe_fetch(url)
            entry = extract_launch_from_page(page_html, url)
            if entry:
                results.append(entry)
        except Exception as e:
            errors.append(f"Error fetching {url}: {e}")

    print(json.dumps({
        "platform": "yc_launch",
        "query": query,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "results": results,
        "errors": errors,
    }, indent=2))


if __name__ == "__main__":
    main()
