# Clean up old files
Remove-Item scrape_progress.json, drugs_data.json -ErrorAction SilentlyContinue

# Install dependencies
pip install selenium beautifulsoup4 webdriver-manager