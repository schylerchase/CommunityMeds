# Uninstall the old dependency
pip uninstall webdriver-manager -y

# Make sure selenium is up to date
pip install --upgrade selenium beautifulsoup4

# Try again
python drugs_scraper.py --letters a --max 5