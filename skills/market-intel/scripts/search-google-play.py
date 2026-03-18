#!/usr/bin/env python3
"""Google Play Store crawler via HTML scraping. Zero external dependencies.
Usage: python3 search-google-play.py "<keywords>" [limit]
Output: JSON CrawlResult to stdout
"""

import json
import re
import sys
import urllib.request
import urllib.parse
from datetime import datetime, timezone
from html.parser import HTMLParser


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


def extract_app_ids_from_search(html):
    """Extract app IDs from Google Play search page HTML."""
    # Google Play links: /store/apps/details?id=com.example.app
    ids = re.findall(r'/store/apps/details\?id=([a-zA-Z0-9_.]+)', html)
    # Deduplicate while preserving order
    seen = set()
    unique = []
    for app_id in ids:
        if app_id not in seen:
            seen.add(app_id)
            unique.append(app_id)
    return unique


def extract_json_ld(html):
    """Extract JSON-LD structured data from HTML."""
    matches = re.findall(
        r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',
        html, re.DOTALL
    )
    for match in matches:
        try:
            data = json.loads(match)
            if isinstance(data, dict) and data.get("@type") == "SoftwareApplication":
                return data
        except (json.JSONDecodeError, ValueError):
            continue
    return None


def extract_app_details(html, app_id):
    """Extract app details from a Google Play detail page."""
    url = f"https://play.google.com/store/apps/details?id={app_id}"

    # Try JSON-LD first (most reliable)
    json_ld = extract_json_ld(html)
    if json_ld:
        name = json_ld.get("name", "")
        description = json_ld.get("description", "")
        rating = None
        review_count = None
        agg = json_ld.get("aggregateRating", {})
        if agg:
            try:
                rating = round(float(agg.get("ratingValue", 0)), 1)
                review_count = int(agg.get("ratingCount", 0))
            except (ValueError, TypeError):
                pass

        price_text = json_ld.get("offers", {}).get("price", "0")
        is_free = str(price_text) in ("0", "0.00", "")

        return {
            "name": name,
            "url": url,
            "description": truncate(description),
            "rating": rating if rating else None,
            "reviewCount": review_count if review_count else None,
            "pricing": {
                "free": is_free,
                "other": None if is_free else str(price_text),
            },
            "features": [],
            "reviews": [],
        }

    # Fallback: meta tags
    name_match = re.search(r'<meta\s+property="og:title"\s+content="([^"]*)"', html)
    desc_match = re.search(r'<meta\s+property="og:description"\s+content="([^"]*)"', html)
    name = name_match.group(1) if name_match else ""
    description = desc_match.group(1) if desc_match else ""

    if not name:
        return None

    return {
        "name": name.replace(" - Apps on Google Play", ""),
        "url": url,
        "description": truncate(description),
        "rating": None,
        "reviewCount": None,
        "pricing": {"free": True},
        "features": [],
        "reviews": [],
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python3 search-google-play.py <keywords> [limit]"}))
        sys.exit(1)

    query = sys.argv[1]
    limit = 5
    if len(sys.argv) >= 3:
        try:
            limit = max(1, min(int(sys.argv[2]), 10))
        except ValueError:
            limit = 5

    errors = []
    search_url = (
        f"https://play.google.com/store/search?"
        f"q={urllib.parse.quote(query)}&c=apps&hl=en&gl=us"
    )

    try:
        search_html = safe_fetch(search_url)
    except Exception as e:
        print(json.dumps({
            "platform": "google_play", "query": query,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "results": [], "errors": [f"Google Play search error: {e}"],
        }, indent=2))
        return

    app_ids = extract_app_ids_from_search(search_html)[:limit]

    if not app_ids:
        errors.append("No app IDs found — page may be JS-rendered")
        print(json.dumps({
            "platform": "google_play", "query": query,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "results": [], "errors": errors,
        }, indent=2))
        return

    results = []
    for app_id in app_ids:
        detail_url = f"https://play.google.com/store/apps/details?id={app_id}&hl=en&gl=us"
        try:
            detail_html = safe_fetch(detail_url)
            entry = extract_app_details(detail_html, app_id)
            if entry:
                results.append(entry)
        except Exception as e:
            errors.append(f"Failed to fetch {app_id}: {e}")

    print(json.dumps({
        "platform": "google_play",
        "query": query,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "results": results,
        "errors": errors,
    }, indent=2))


if __name__ == "__main__":
    main()
