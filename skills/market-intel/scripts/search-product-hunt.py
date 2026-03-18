#!/usr/bin/env python3
"""Product Hunt crawler via HTML scraping + __NEXT_DATA__ extraction. Zero deps.
Usage: python3 search-product-hunt.py "<keywords>" [limit]
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


def extract_next_data(html):
    """Extract __NEXT_DATA__ JSON from a Next.js page."""
    match = re.search(r'<script\s+id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.DOTALL)
    if not match:
        return None
    try:
        return json.loads(match.group(1))
    except (json.JSONDecodeError, ValueError):
        return None


def deep_find_posts(obj, depth=0, max_depth=8):
    """Recursively find post-like objects in nested data."""
    if depth > max_depth or not isinstance(obj, (dict, list)):
        return []

    posts = []
    if isinstance(obj, list):
        for item in obj:
            posts.extend(deep_find_posts(item, depth + 1, max_depth))
        return posts

    # Check if this dict looks like a post
    if "slug" in obj and "name" in obj and isinstance(obj.get("name"), str):
        posts.append(obj)

    for value in obj.values():
        if isinstance(value, (dict, list)):
            posts.extend(deep_find_posts(value, depth + 1, max_depth))

    return posts


def extract_post_urls(html):
    """Extract product post URLs from search results."""
    urls = []
    seen = set()
    for match in re.finditer(r'href="(/posts/[^"?#]+)"', html):
        path = match.group(1)
        if path not in seen:
            seen.add(path)
            urls.append(f"https://www.producthunt.com{path}")
    return urls


def extract_post_from_page(html, url):
    """Extract product details from a Product Hunt post page."""
    next_data = extract_next_data(html)

    if next_data:
        # Search for post object in __NEXT_DATA__
        posts = deep_find_posts(next_data)
        for post in posts:
            name = post.get("name", "")
            if not name:
                continue

            tagline = post.get("tagline", "")
            description = post.get("description", "") or tagline
            votes = post.get("votesCount", 0)
            rating = post.get("reviewsRating")
            review_count = post.get("reviewsCount") or votes
            topics = [t.get("name", "") for t in post.get("topics", []) if isinstance(t, dict)]

            return {
                "name": name,
                "url": url,
                "description": truncate(description),
                "tagline": tagline or None,
                "rating": round(float(rating), 1) if rating else None,
                "reviewCount": review_count or None,
                "pricing": {"free": True, "other": post.get("pricing")},
                "features": [t for t in topics[:5] if t],
                "reviews": [],
            }

    # Fallback: meta tags
    name_match = re.search(r'<meta\s+property="og:title"\s+content="([^"]*)"', html)
    desc_match = re.search(r'<meta\s+property="og:description"\s+content="([^"]*)"', html)
    name = name_match.group(1).replace(" | Product Hunt", "") if name_match else ""
    description = desc_match.group(1) if desc_match else ""

    if not name:
        return None

    return {
        "name": name,
        "url": url,
        "description": truncate(description),
        "tagline": None,
        "pricing": {"free": True},
        "features": [],
        "reviews": [],
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python3 search-product-hunt.py <keywords> [limit]"}))
        sys.exit(1)

    query = sys.argv[1]
    limit = 5
    if len(sys.argv) >= 3:
        try:
            limit = max(1, min(int(sys.argv[2]), 10))
        except ValueError:
            limit = 5

    errors = []
    search_url = f"https://www.producthunt.com/search?q={urllib.parse.quote(query)}"

    try:
        search_html = safe_fetch(search_url)
    except Exception as e:
        print(json.dumps({
            "platform": "product_hunt", "query": query,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "results": [], "errors": [f"Product Hunt search error: {e}"],
        }, indent=2))
        return

    # Try to get post URLs from search page
    post_urls = extract_post_urls(search_html)[:limit]

    # Fallback: extract from __NEXT_DATA__ on search page
    if not post_urls:
        next_data = extract_next_data(search_html)
        if next_data:
            posts = deep_find_posts(next_data)
            post_urls = [
                f"https://www.producthunt.com/posts/{p['slug']}"
                for p in posts[:limit] if p.get("slug")
            ]

    if not post_urls:
        errors.append("No post URLs found — page may require JS rendering")
        print(json.dumps({
            "platform": "product_hunt", "query": query,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "results": [], "errors": errors,
        }, indent=2))
        return

    results = []
    for url in post_urls:
        try:
            page_html = safe_fetch(url)
            entry = extract_post_from_page(page_html, url)
            if entry:
                results.append(entry)
        except Exception as e:
            errors.append(f"Error fetching {url}: {e}")

    print(json.dumps({
        "platform": "product_hunt",
        "query": query,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "results": results,
        "errors": errors,
    }, indent=2))


if __name__ == "__main__":
    main()
