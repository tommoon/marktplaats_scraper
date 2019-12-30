  
# Introduction  
  
This is a full stack solution to Badi's coding challenge to create a flight booking system.  The App runs on React.js and Node.js with a small database powerered by Pouchdb.  
  

# marktplaats_scraper
scaper for the SERP of marktplaats
## Installation

  
To execute the scraper run:  
  
    npm install  
    node start  
  
 
## Running in Production mode  
In the current configuration, the scraper will save results to the results folder in the root of the project.

To save to an S3 bucket:

 1. In the .env file in the project root change LOCAL to false.
 2. In the export.js file, change the accessKeyId and secretAccessKey to the desired configuration for your S3 instance.
