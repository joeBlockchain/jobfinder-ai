from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Set up Chrome options for headless browsing
options = Options()
options.add_argument("--headless")  # Run in headless mode
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

# Path to your chromedriver executable
chromedriver_path = '/path/to/chromedriver'

# Initialize the driver
driver = webdriver.Chrome(executable_path=chromedriver_path, options=options)

# URL of the Microsoft careers page
url = "https://jobs.careers.microsoft.com/global/en/search-results"

# Navigate to the page
driver.get(url)

# Wait for the dynamic content to load
wait = WebDriverWait(driver, 10)
wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[role="presentation"].ms-List-surface')))

# Now you can access the full DOM
page_source = driver.page_source

# You can now use BeautifulSoup to parse the page_source
soup = BeautifulSoup(page_source, "html.parser")

# Find the parent div with role 'presentation' and class 'ms-List-surface'
parent_div = soup.find('div', {'role': 'presentation', 'class': 'ms-List-surface'})

if parent_div:
    # Iterate over immediate child divs of the parent div and print their HTML
    for child in parent_div.find_all('div', recursive=False):  # recursive=False ensures only immediate children
        print(child)
        print("----------")  # Separator for readability
else:
    print("Parent div not found.")

# Close the browser
driver.quit()