const puppeteer = require("puppeteer");

(async () => {
  try {
    // Launch a new browser instance
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Define the base URL for the Microsoft job board without the page number
    const baseUrl =
      "https://jobs.careers.microsoft.com/global/en/search?lc=United%20States&l=en_us&pgSz=20&o=Relevance&flt=true";

    // Initialize an empty array to store the scraped job postings
    const jobPostings = [];

    // Navigate to the page to extract the total number of pages
    await page.goto(baseUrl + "&pg=1", { waitUntil: "networkidle0" });

    // Extract the total number of pages
    const totalPages = await page.evaluate(() => {
      const nextButton = document.querySelector(
        'button[aria-label="Go to next page"]'
      );
      const paginationSpan = nextButton.parentElement.previousElementSibling;
      const totalPagesText = paginationSpan.textContent;
      const totalPagesMatch = totalPagesText.match(/(\d+)/);
      return totalPagesMatch ? parseInt(totalPagesMatch[1], 10) : 1;
    });

    console.log("Total pages: ", totalPages);

    // Determine the number of pages to scrape, limited to 5 or total pages available
    const pagesToScrape = Math.min(totalPages, 1);

    // Loop through the determined number of pages
    for (let currentPage = 1; currentPage <= pagesToScrape; currentPage++) {
      // Construct the URL for the current page by dynamically adding the page number
      const url = `${baseUrl}&pg=${currentPage}`;

      console.log(`Navigating to URL: ${url}`);
      await page.goto(url, { waitUntil: "networkidle0" });

      // Wait for the job postings to be present on the page
      await page.waitForSelector(".ms-List-page", { timeout: 10000 });

      // Extract the job posting elements from the page
      console.log("Extracting job postings from page", currentPage);
      const jobElements = await page.$$("div[role='listitem']");

      // Extract information from each job posting element
      for (const jobElement of jobElements) {
        const title = await jobElement.$eval("h2", (el) =>
          el.textContent.trim()
        );
        const jobId = await jobElement.$eval(
          '[aria-label^="Job item"]',
          (el) => {
            const match = el.getAttribute("aria-label").match(/(\d+)/);
            return match ? match[1] : null;
          }
        );

        // Construct the job URL slug
        const jobUrlSlug = `https://jobs.careers.microsoft.com/global/en/job/${jobId}/${title.replace(
          /\s+/g,
          "-"
        )}`;

        // Store the extracted information in an object
        jobPostings.push({ title, jobId, jobUrlSlug });
      }
    }

    // Second Loop: Iterate over the collected job postings
    // Assuming jobPostings is populated with at least one job posting
    if (jobPostings.length > 0) {
      const job = jobPostings[0]; // Only review the first record
      console.log(`Reviewing job page: ${job.title}`);
      await page.goto(job.jobUrlSlug, { waitUntil: "networkidle0" });

      // Wait for the div with role="group" and class="ms-DocumentCard" to be present
      const selector = 'div[role="group"].ms-DocumentCard';
      await page.waitForSelector(selector, { timeout: 1000 });

      // Extract and print the HTML of all children within the div
      const childrenHTML = await page.$eval(selector, (div) => div.innerHTML);
      console.log(`Children HTML of ${job.title}:`, childrenHTML);
    }

    // Close the browser
    await browser.close();

    // Print the scraped job postings
    console.log(jobPostings);
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
