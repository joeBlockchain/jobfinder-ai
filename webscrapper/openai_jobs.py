import requests
import re
from bs4 import BeautifulSoup
import os
from dotenv import load_dotenv
from convex import ConvexClient
from openai_helper import extract_years_of_exp, return_text_embedding
import json


load_dotenv()

# Initialize Convex client
NEXT_PUBLIC_CONVEX_URL = os.getenv("NEXT_PUBLIC_CONVEX_URL")
convex_client = ConvexClient(NEXT_PUBLIC_CONVEX_URL)

# Initialize counters
job_count = 0 

# Fetch the content of the careers page
url = "https://openai.com/careers/search"
response = requests.get(url)
webpage = response.content

# Parse the webpage content
soup = BeautifulSoup(webpage, "html.parser")

# Find the section containing the job postings
job_results_section = soup.find('section', id='jobResultsSection0')

# Assuming job postings are listed within <li> tags within the jobResultsSection0
job_postings = job_results_section.find_all("li", class_="pt-16 pb-24 md:py-16 lg:py-24 border-t border-secondary")

base_url = "https://openai.com"

def clean_text(html_content):
    # Remove HTML tags
    soup = BeautifulSoup(html_content, 'html.parser')
    text = soup.get_text()
    
    # Remove special characters and punctuation
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove stop words (you can use NLTK or create your own list)
    stop_words = ['the', 'a', 'an', 'in', 'on', 'at', 'for', 'and', 'but', 'or', 'yet', 'so']
    tokens = text.split()
    filtered_tokens = [token for token in tokens if token not in stop_words]
    
    # Remove numerical values
    filtered_tokens = [token for token in filtered_tokens if not token.isdigit()]
    
    # Join the tokens back into a string
    cleaned_text = ' '.join(filtered_tokens)
    
    return cleaned_text


for job in job_postings:
    try:
        # Extract job details
        title = job.find("h3").text.strip() if job.find("h3") else "Title not found"
        span_text = job.find("span", class_="f-body-1").text.strip() if job.find("span", class_="f-body-1") else "Info not found"
        location, department = (span_text.split("—") + ["Department not found"])[:2] if "—" in span_text else (span_text, "Department not found")
        location = location.strip()
        department = department.strip()
        posting_link_tag = job.find("a", href=True)
        posting_link = base_url + posting_link_tag['href'] if posting_link_tag else "Link not found"

        # Fetch job details page HTML content
        job_details_response = requests.get(posting_link)
        job_details_content = job_details_response.content
        job_details_soup = BeautifulSoup(job_details_content, "html.parser")

        # Extract the "Apply now" link
        application_link_tag = job.find("a", attrs={"aria-label": "Apply now"})
        application_link = application_link_tag['href'] if application_link_tag else "Application link not found"

        # Extract the unique slug from the application link
        slug = application_link.split('/')[-2] if application_link and application_link != "Application link not found" else "Slug not found"

        # Extract full description and salary range
        description_div = job_details_soup.find('div', class_='ui-description ui-richtext')
        full_description_html = str(description_div) if description_div else "Description not found"
        
        #get description embedding
        cleaned_description_text = clean_text(full_description_html)

        embedding = return_text_embedding(cleaned_description_text)
        embedding_results = convex_client.action('jobs:similarJobs', {'embedding': embedding})

        if embedding_results is not None:
            # Extract the '_id' and '_score' values from the similar job results
            embeddedJobMatches = []
            # print("embedding results in python:", embedding_results)
            
            # Initialize variables for tracking the highest user rating
            highest_user_rating = "unknown"
            highest_user_rating_score = -1
            
            for result in embedding_results:
                # if result['_score'] > 0.80:  # Check if the similarity score is above 0.80
                    matching_jobs = convex_client.query('jobs:fetchJobsByEmbeddingId', {'ids': [result['_id']]})
                    if matching_jobs:
                        # Extract only the required info: matching job id, embedding id and score
                        matching_job_info = {
                            'matchingJobId': matching_jobs[0]['_id'],
                            'embeddingId': result['_id'],
                            'score': result['_score']
                        }
                        embeddedJobMatches.append(matching_job_info)
                        
                        # Check if the matching job has a user rating other than "unknown"
                        if 'user_rating' in matching_jobs[0] and matching_jobs[0]['user_rating'] != "unknown":
                            # Update the highest user rating if the current job's rating is higher
                            if result['_score'] > highest_user_rating_score:
                                highest_user_rating = matching_jobs[0]['user_rating']
                                highest_user_rating_score = result['_score']
            
            # Set the predicted user rating based on the highest user rating found
            predicted_user_rating = highest_user_rating if highest_user_rating != "unknown" else "neutral"
            
            # Extract the '_id' values from the results to pass to the query
            embedding_ids = [result['_id'] for result in embedding_results if result['_score'] > 0.80]  # Filter embedding_ids based on score
            job_data = convex_client.query('jobs:fetchJobsByEmbeddingId', {'ids': embedding_ids})
            # print("job_data from convex in backend main:", job_data)
            # print("matching jobs:", embeddedJobMatches)
        else:
            print(f"No similar jobs found for embedding: {title}")
            predicted_user_rating = "neutral"
            embeddedJobMatches = []  # Set embeddedJobMatches to an empty list if no similar jobs found
                
        # Find the specific <p> tag and extract the first <li> tag that follows it
        all_text_elements = job_details_soup.find_all(string=True)
        years_of_exp_texts = []

        # Find all text elements and concatenate those containing "year"
        for element in all_text_elements:
            if 'year' in element.lower():  # Check for 'year' in a case-insensitive manner
                years_of_exp_texts.append(element.strip())

        # Join all found sentences into one big string
        concatenated_years_of_exp_text = ". ".join(years_of_exp_texts)

        # Now you can use your existing logic to extract years of experience from concatenated_years_of_exp_text
        # For example, if the logic expects a string:
        if concatenated_years_of_exp_text:  # Ensure the string is not empty
            years_of_exp = extract_years_of_exp(concatenated_years_of_exp_text)
            years_of_exp_json = json.loads(years_of_exp)
            years_of_exp_value = years_of_exp_json["Years of Experience"]
        else:
            years_of_exp_value = "Years of experience not found"

        salary_range_heading = job_details_soup.find('p', string=lambda text: 'Annual Salary' in text if text else False)
        salary_range = "Salary range not found"
        salary_midpoint = None  # Initialize salary_midpoint as None
        if salary_range_heading:
            salary_range_p = salary_range_heading.find_next_sibling('p')
            if salary_range_p and salary_range_p.span:
                salary_range = salary_range_p.span.text.strip()
                # Extract numerical values from the salary_range string
                salary_values = [float(s.replace('K', '000').replace('$', '').replace(',', '')) for s in salary_range.split() if s.replace('K', '000').replace('$', '').replace(',', '').replace('.', '', 1).isdigit()]
                if len(salary_values) == 1:  # If there's only one value, it's both the lower and upper bound
                    salary_midpoint = salary_values[0]
                elif len(salary_values) == 2:  # If there are two values, calculate the midpoint
                    salary_midpoint = sum(salary_values) / 2


        # Use Convex mutation to create job entry
        job_data = {
            "company": "OpenAI",
            "salary_range": salary_range,
            "years_of_experience": years_of_exp_value,
            "title": title,
            "location": location,
            "department": department,
            "posting_link": posting_link,
            "apply_link": application_link,
            "posting_id": slug,
            "full_description": full_description_html,
            "salary_midpoint": 0,  # Populate salary_midpoint with a placeholder value of 0
            "description_embedding": embedding,
            "predicted_user_rating": predicted_user_rating,
            "embeddedJobMatches": embeddedJobMatches
        }
        if salary_midpoint is not None:
            job_data["salary_midpoint"] = salary_midpoint

        job_id = convex_client.mutation("jobs:createJob", job_data)

        
        job_count += 1
        print(f"{job_count}. Added job: {title}")

    except Exception as e:
        print(f"An error occurred while processing a job posting{e}")

print(f"Total jobs added: {job_count}")



