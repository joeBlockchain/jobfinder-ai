from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Set up the Selenium WebDriver (e.g., ChromeDriver)
driver = webdriver.Chrome()  # Make sure you have ChromeDriver installed and in PATH

# Define the base URL for the Microsoft job board
base_url = 'https://jobs.careers.microsoft.com/global/en/search?l=en_us&pg={}&pgSz=20&o=Relevance&flt=true&ref=cms'

# Initialize an empty list to store the scraped job postings
job_postings = []

# Iterate through the pages
current_page = 1
while True:
    # Construct the URL for the current page
    url = base_url.format(current_page)
    
    # Navigate to the URL
    driver.get(url)
    
    # Wait for the job postings to be present on the page (adjust the timeout as needed)
    job_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'li.ms-list-item'))
    )
    
    # Find all the job posting elements within the container
    job_elements = job_container.find_elements(By.CSS_SELECTOR, 'li.ms-list-item')
    
    # Extract information from each job posting element
    for job_element in job_elements:
        # Extract the desired information (e.g., title, location, description)
        title = job_element.find_element(By.CSS_SELECTOR, 'h2').text
        location = job_element.find_element(By.CSS_SELECTOR, 'span.location').text
        description = job_element.find_element(By.CSS_SELECTOR, 'p.description').text
        
        # Store the extracted information in a dictionary or perform further processing
        job_postings.append({
            'title': title,
            'location': location,
            'description': description
        })
    
    # Check if there are more pages to scrape
    next_page_link = driver.find_elements(By.CSS_SELECTOR, 'a.next-page')
    if not next_page_link:
        break
    
    current_page += 1

# Close the browser
driver.quit()

# Print the scraped job postings
for posting in job_postings:
    print(posting)