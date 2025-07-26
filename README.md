## Understanding 
  Through this project i have gained significant understanding of what a qms system is and why it is used . I now understand who uses qms and how they use it

## Thought Process
  The first design choice i had to make was who whould be using the system . I was asked to have a event list and event add page . One user who can add and view all events is a Supervisor . So i decided my user . Next step was to decide which events i need to consider . I decided i would start with deviation and CAPA and if time permitted , add more events . Unfortunately i was unable to add more events .
  I was also not able to implement 5 ai tools due to time constraint , i could only implement 2 ai tools , one for making changes in data form and one for providing summary of a specific event . 
  All the events are listed in order of their severity . 
  Common details of events are stored in events table while capa and deviation have their own tables to store information which is unique to them

## Problems Faced
  The biggest problem i faced was the time constraint . To combat this i started with basic and then scaled it up . eg : i created the entire flow for deviaition event , then i moved onto capa event , if time had permitted i would have moved onto other events also 

## Future Improvemets
  -Expanded User Roles: Introducing roles like Operator (can only create events) and Quality Assurance (can review and approve), which would enable full, multi-stage approval workflows.
  -Advanced AI Capabilities: Expanding the AI to perform Trend Analysis across all events and provide Root Cause Suggestions based on historical data.

## How to setup 
1. Clone the Repository:
     git clone https://github.com/Shebin2003/qms-project.git
     cd qms-project/backend
2. Create and Activate Virtual Environment
3. Install Dependencies:
4. Set Up Environment Variables
     GROQ_API_KEY="your_api_key_here"
     DATABASE_URL = "your_database_url_here"
5. Run backend : uvicorn main:app --reload
6. npm install (frontend)
7. npm run dev
