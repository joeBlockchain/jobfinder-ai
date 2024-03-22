# openai_helper.py
import openai
from dotenv import load_dotenv
load_dotenv()

from openai import OpenAI

client = OpenAI()


def return_text_embedding(text_to_embed):
    response = client.embeddings.create(
        input=text_to_embed,
        model="text-embedding-3-large"
    )

    return(response.data[0].embedding)

def extract_years_of_exp(job_posting_description):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo-0125",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "You are a helpful assistant designed to output JSON. The user will supply a job posting and will ask how many years of experience the job requires. If the posting specifies a range, please output your response as Years of Experience: 5-10. If the posting specifies a single number, please output your response as Years of Experience: 5. If the posting does not specify a number, please output your response as Years of Experience: Not specified."},
            {"role": "user", "content": "How many years of experience does this job posting require? Posting: " + job_posting_description},
        ]
    )
    # print(response)
    return response.choices[0].message.content

def extract_salary_info(salary_text):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo-0125",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "You are a helpful assistant designed to output JSON. The user will supply a few bullet points from a job posting and will ask what is the salary range provided in the posting. If the posting specifies a range, please output your response as Salary Range: $200k - $300k. If the posting specifies a single number, please output your response as Salary Range: $200k. If the posting does not specify a number or you cannot determin the salary for the job posting then, please output your response as Salary Range: Not specified."},
            {"role": "user", "content": "What is the salary range provided in this job posting? Posting: " + salary_text},
        ]
    )
    return response.choices[0].message.content

