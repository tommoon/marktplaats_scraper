# marktplaats_scraper
scaper for the SERP of marktplaats
## Installation

  
To execute the scraper run:  
  
    npm install  
    node start  
  
  ## Usage
  
  to run the scraper execute 
  
    node start 
    
  in the root of the project. 
  
  Results will be saved in the folder 'finalResults'. Also a manifest.json will be produced in the root of the project. this file contains information on the results scraped in each category.
 
## Running in Production mode  
In the current configuration, the scraper will save results to the results folder in the root of the project. When running on Lmbda servers, it is better to save in an S3 bucket so as to not incur extra costs.

To save to an S3 bucket:

 1. In the .env file in the project root change LOCAL to false.
 2. In the export.js file, change the accessKeyId and secretAccessKey to the desired configuration for your S3 instance.
 
 
