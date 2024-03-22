import requests
from bs4 import BeautifulSoup
import re
import html2text
import os
from convex import ConvexClient
import json
from openai_helper import extract_years_of_exp, return_text_embedding, extract_salary_info  # Assuming these functions are reusable

# Initialize Convex client
NEXT_PUBLIC_CONVEX_URL = os.getenv("NEXT_PUBLIC_CONVEX_URL")
convex_client = ConvexClient(NEXT_PUBLIC_CONVEX_URL)

def clean_text(html_content):
    # Remove HTML tags using BeautifulSoup
    soup = BeautifulSoup(html_content, 'html.parser')
    text = soup.get_text()
    
    # Remove special characters and punctuation
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    
    # Convert to lowercase
    text = text.lower()
    
    # Optionally, remove stop words
    stop_words = set(['the', 'a', 'an', 'in', 'on', 'at', 'for', 'and', 'but', 'or', 'yet', 'so'])
    text = ' '.join([word for word in text.split() if word not in stop_words])
    
    # Remove numerical values (optional, based on whether they're relevant to your analysis)
    text = re.sub(r'\b\d+\b', '', text)
    
    return text

url = "https://jobs.lever.co/Anthropic"
response = requests.get(url)
soup = BeautifulSoup(response.content, "html.parser")


postings_groups = soup.find_all("div", class_="postings-group")

for group in postings_groups:
    department = group.find("div", class_="posting-category-title").text.strip()
    postings = group.find_all("div", class_="posting")
    
    for posting in postings:
        title = posting.find("h5", {"data-qa": "posting-name"}).text.strip()
        location = posting.find("span", class_="location").text.strip()
        
        posting_link = posting.find("a", class_="posting-title")["href"]
        application_link = posting.find("a", class_="posting-btn-submit")["href"]
        posting_id = application_link.split("/")[-1]
        
        # Visit the posting_link and extract additional information
        posting_response = requests.get(posting_link)
        posting_soup = BeautifulSoup(posting_response.content, "html.parser")

        # Find the main container for the job description
        description_container = posting_soup.find("div", class_="section-wrapper page-full-width")

        # If you want to keep the HTML for further processing or display
        full_description_html = str(description_container) if description_container else "Description not found"

        # If you prefer to convert the HTML content to text
        # You can use the .get_text() method or html2text for more complex conversions
        if description_container:
            h = html2text.HTML2Text()
            h.ignore_links = True
            full_description_markdown = h.handle(str(description_container))
        else:
            full_description_markdown = "Description not found"

        # Extract years of experience
        # Split the description into sentences
        sentences = full_description_markdown.split('.')

        # Filter sentences that contain the word 'year' (case insensitive)
        filtered_sentences = [sentence.strip() for sentence in sentences if 'year' in sentence.lower()]

        # Join the filtered sentences back into a single string
        filtered_description = '. '.join(filtered_sentences)

        # Now, use `filtered_description` instead of the full description for extracting years of experience
        if filtered_description:  # Ensure the string is not empty
            years_of_exp_text = extract_years_of_exp(filtered_description)
            years_of_exp_json = json.loads(years_of_exp_text)
            years_of_exp_value = years_of_exp_json.get("Years of Experience", "Years of experience not found")
        else:
            years_of_exp_value = "Years of experience not found"

        # Clean the HTML content
        cleaned_description_text = clean_text(full_description_html)

        # Generate the description embedding with the cleaned text
        description_embedding = return_text_embedding(cleaned_description_text)

        company = "Anthropic"  # Assuming the company is always Anthropic
        
        salary_range_element = posting_soup.find("li", string=lambda text: "$" in text if text else False)
        salary_range = salary_range_element.text.strip() if salary_range_element else "Salary range not found"
        
        salary_range_text = extract_salary_info(salary_range)  # Assuming this function can handle the text format
        salary_range_json = json.loads(salary_range_text)
        salary_range_value = salary_range_json.get("Salary Range", "Salary range not found")

        salary_values = re.findall(r"\$(\d+)k", salary_range)
        if len(salary_values) == 2:
            salary_midpoint = (int(salary_values[0]) + int(salary_values[1])) / 2 * 1000
        else:
            salary_midpoint = None

        posting_headline = posting_soup.find("div", class_="posting-headline")
        full_description_html = str(posting_headline.find_next_sibling("div", class_="section-wrapper"))
        
        embedding = return_text_embedding(cleaned_description_text)
        embedding_results = convex_client.action('jobs:similarJobs', {'embedding': embedding})

        if embedding_results is not None:
            # Extract the '_id' and '_score' values from the similar job results
            embeddedJobMatches = []
            print("embedding results in python:", embedding_results)
            
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
            print("job_data from convex in backend main:", job_data)
            print("matching jobs:", embeddedJobMatches)
        else:
            print(f"No similar jobs found for embedding: {title}")
            predicted_user_rating = "neutral"
            embeddedJobMatches = []  # Set embeddedJobMatches to an empty list if no similar jobs found
    
        job_data = {
            "company": "Anthropic",
            "salary_range": salary_range_value,
            "years_of_experience": years_of_exp_value,
            "title": title,
            "location": location,
            "department": department,
            "posting_link": posting_link,
            "apply_link": application_link,
            "posting_id": posting_id,
            "full_description": full_description_html,  # or full_description_markdown, depending on what you want to store
            "salary_midpoint": salary_midpoint if salary_midpoint is not None else 0,
            "description_embedding": description_embedding,
            "predicted_user_rating": predicted_user_rating,
            "embeddedJobMatches": embeddedJobMatches
        }

        # Push the job data to the Convex database
        try:
            job_id = convex_client.mutation("jobs:createJob", job_data)
            print(f"Job {title} added to ConvexDB with ID: {job_id}")
        except Exception as e:
            print(f"An error occurred while pushing job data to ConvexDB: {e}")