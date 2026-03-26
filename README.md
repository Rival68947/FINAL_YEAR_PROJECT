# AI-Powered Academic Assistant using Hybrid RAG

An intelligent academic support system that answers student queries from faculty-approved academic notes using Hybrid Retrieval-Augmented Generation (RAG), with role-based access control and course-wise knowledge isolation.

## Overview

This project is designed to help students get accurate, syllabus-based answers from their own academic materials instead of relying on generic AI responses. Faculty members upload course documents such as notes and study material, and the system retrieves relevant content from those documents before generating a response.

The core idea is to keep academic notes as the primary source of truth while using generative AI only to improve clarity, simplify explanations, and make responses easier to understand.

## Problem Statement

In colleges, academic information like syllabus content, notes, policies, and study material is often scattered across multiple PDFs and platforms. Students face difficulty in:

* finding exact answers quickly
* understanding complex topics from raw notes
* trusting AI-generated answers due to hallucination

This project solves that problem by restricting AI responses to trusted, faculty-uploaded academic content.

## Key Idea

The application follows a **Hybrid RAG** approach:

### Primary Source

* Faculty-uploaded academic notes
* Course-wise, subject-wise, and semester-wise organization
* Stored in a vector database for semantic retrieval

### Secondary Source

* General AI knowledge
* Used only to simplify explanations or add examples
* Never allowed to override retrieved academic content

This ensures both **accuracy** and **clarity**.

## USP

Unlike generic AI chatbots, this system answers questions strictly from faculty-approved academic notes using Hybrid RAG, which makes the responses syllabus-aligned, more reliable, and less prone to hallucination.

## Features

* Role-based access control for faculty and students
* Faculty-only document upload and knowledge base management
* Course-wise and subject-wise academic content organization
* PDF processing and vector embedding pipeline
* Subject-specific vector database retrieval
* Hybrid RAG-based question answering
* Reduced hallucination through trusted content grounding
* Chat-based academic assistant interface

## Roles

### Faculty

* Upload notes and academic documents
* Assign documents to course, subject, and semester
* Manage the academic knowledge base

### Student

* Log in to the system
* Select course and subject
* Ask questions in chat
* Receive answers grounded in approved notes

## How It Works

1. Faculty uploads academic notes in PDF format.
2. The system extracts text from the uploaded files.
3. The text is split into chunks.
4. Chunks are converted into embeddings.
5. Embeddings are stored in a subject-wise vector database.
6. A student selects a course/subject and asks a question.
7. The system retrieves the most relevant chunks from the vector database.
8. The LLM generates an answer using the retrieved context.
9. If needed, AI enhances the answer with simple explanation support without overriding the source material.

## Application Flow

### Faculty Workflow

1. Faculty logs in
2. Uploads PDF notes
3. Selects course, subject, and semester
4. System validates and processes the document
5. Text is chunked and converted into embeddings
6. Embeddings are stored in the vector database
7. Knowledge base is updated

### Student Workflow

1. Student logs in
2. Selects course and subject
3. Asks a question
4. System retrieves relevant chunks from the subject-wise vector database
5. LLM generates an answer based on retrieved context
6. Answer is displayed in chat

## Suggested Tech Stack

### Frontend

* React
* Tailwind CSS

### Backend

* Python
* FastAPI

### AI / RAG

* LangChain
* Embedding model
* Large Language Model (LLM)

### Vector Database

* FAISS

### Database

* MongoDB 

### Authentication

* JWT-based authentication
* Role-based authorization

## Folder Structure

```text
AI-Academic-Assistant/
│
├── backend/
│   ├── main.py
│   ├── auth/
│   │   ├── login.py
│   │   └── roles.py
│   ├── routes/
│   │   ├── faculty.py
│   │   └── student.py
│   ├── rag/
│   │   ├── pdf_loader.py
│   │   ├── text_splitter.py
│   │   ├── embeddings.py
│   │   ├── vector_store.py
│   │   └── rag_pipeline.py
│   ├── database/
│   │   ├── db.py
│   │   └── models.py
│   └── utils/
│       └── security.py
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
│
├── data/
│   ├── uploads/
│   ├── embeddings/
│   └── vector_db/
│
├── docs/
│   ├── architecture.png
│   ├── flowchart.png
│   └── report.pdf
│
├── requirements.txt
└── README.md
```

## Role of LangChain

LangChain helps connect the main parts of the RAG pipeline. It can be used for:

* loading PDFs and documents
* splitting text into chunks
* generating embeddings
* creating and querying the vector store
* building retriever + LLM pipelines

In this project, LangChain acts as the orchestration layer between uploaded academic content, vector search, and final answer generation.

## Why Hybrid RAG

A normal chatbot may generate incorrect or generic answers. Hybrid RAG improves reliability by first retrieving relevant academic content and then generating a response using that context.

Benefits:

* more accurate answers
* reduced hallucination
* syllabus-based responses
* better trust for academic use

## Example Use Case

**Student Query:**
"Explain deadlock from Operating Systems Unit 3"

**System Behavior:**

* retrieves the deadlock-related section from uploaded OS notes
* uses that content as context
* generates a clear explanation for the student
* adds simple wording support if needed

## Domain / Focus Area

* Student Services
* Academic Support
* Educational Technology (EdTech)
* Artificial Intelligence for Learning Assistance

## Future Scope

* answer citations with page numbers
* multi-language note support
* voice-based academic assistant
* quiz generation from uploaded notes
* faculty analytics for common student doubts
* integration with LMS or college portals

## Team Contribution Suggestion

* Member 1: Architecture and integration
* Member 2: Backend and authentication
* Member 3: RAG pipeline and vector database
* Member 4: Frontend and UI
* Member 5: Documentation, testing, and report

## How to Run

### Backend

1. Create a virtual environment
2. Install dependencies from `requirements.txt`
3. Start the backend server

### Frontend

1. Install frontend dependencies
2. Run the development server

## One-Line Summary

We are building an AI-powered academic assistant that uses Hybrid Retrieval-Augmented Generation to answer student queries accurately from faculty-uploaded academic notes, enhanced with generative AI explanations.

## License

This project is intended for academic and educational use.
## screenshot of the flowchart
<img width="3404" height="8191" alt="campusLearnFlowChart" src="https://github.com/user-attachments/assets/95cef0ce-cae8-4189-8cab-914a049c2f61" />
