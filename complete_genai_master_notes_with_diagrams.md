# Complete Generative AI Master Notes

## From Fundamentals to RAG, Agents, and Tool Calling

---

# Table of Contents

1. Introduction to AI
2. Machine Learning vs Deep Learning vs GenAI
3. Large Language Models (LLMs)
4. How LLMs Work
5. Tokens & Tokenization
6. Context & Context Window
7. Inference vs Training
8. Prompt Engineering
9. LLM Parameters
10. Structured Outputs
11. Tool Calling / Function Calling
12. RAG (Retrieval-Augmented Generation)
13. Similarity Search
14. Embeddings
15. Vector Databases
16. Chunking Strategies
17. Data Types
18. LangChain
19. AI Agents
20. MCP (Model Context Protocol)
21. Hallucinations
22. Guardrails
23. Streaming Responses
24. Memory Systems
25. Fine-Tuning
26. AI Evaluation
27. Full RAG Workflow
28. Enterprise AI Architecture
29. Interview Notes
30. Resume Keywords

---

# 1. Introduction to AI

Artificial Intelligence (AI) refers to systems capable of performing tasks that normally require human intelligence.

Examples:
- Chatbots
- Recommendation systems
- Self-driving cars
- Image recognition
- AI assistants

---

# AI Evolution

```text
Artificial Intelligence (AI)
        ↓
Machine Learning (ML)
        ↓
Deep Learning
        ↓
Generative AI
        ↓
Large Language Models (LLMs)
```

---

# 2. Machine Learning vs Deep Learning vs GenAI

| Technology | Purpose |
|---|---|
| AI | Simulate human intelligence |
| Machine Learning | Learn from data |
| Deep Learning | Neural-network based learning |
| Generative AI | Generate new content |
| LLMs | Generate human-like text |

---

# 3. Large Language Models (LLMs)

## What are LLMs?

Large Language Models are AI models trained on massive text datasets to understand and generate human-like language.

Examples:
- GPT-4
- Claude
- Grok
- Gemini
- Llama

---

# What LLMs Can Do

- Answer questions
- Generate code
- Summarize documents
- Translate languages
- Write content
- Reason over context
- Use tools

---

# 4. How LLMs Work

LLMs predict the next word/token based on previous tokens.

Example:

```text
Input:
"The sky is"

Prediction:
"blue"
```

---

# LLM Workflow

```text
Input Text
    ↓
Tokenization
    ↓
Transformer Model
    ↓
Probability Prediction
    ↓
Next Token Generation
    ↓
Final Response
```

---

# Transformer Architecture

Transformers are the core architecture behind modern LLMs.

Main concepts:
- Attention mechanism
- Self-attention
- Positional encoding
- Parallel processing

---

# Attention Mechanism

Attention helps the model focus on important words.

Example:

```text
"Ali dropped the glass because it was fragile"
```

The model understands:
"it" refers to "glass"

---

# 5. Tokens & Tokenization

## Tokens

Tokens are the smallest units processed by LLMs.

Examples:

```text
"Hello world"
```

May become:

```text
["Hello", "world"]
```

or partial words.

---

# Tokenization

Converting text into tokens.

```text
Sentence
    ↓
Tokenizer
    ↓
Tokens
```

---

# Why Tokens Matter

LLMs:
- process tokens
- charge per token
- have token limits

---

# 6. Context & Context Window

## Context

Context includes:
- user input
- system instructions
- previous messages
- retrieved RAG data
- memory

---

# Context Window

Maximum number of tokens an LLM can process simultaneously.

Example:

| Model | Context Window |
|---|---|
| Small Models | Small |
| GPT-4 | Large |

---

# Context Window Problem

Large documents may exceed token limits.

Solution:
- chunking
- summarization
- retrieval

---

# 7. Training vs Inference

## Training

The learning phase where models learn patterns from huge datasets.

```text
Massive Data
    ↓
Training
    ↓
Trained Model
```

---

## Inference

The phase where the trained model generates output.

```text
User Input
    ↓
LLM
    ↓
Generated Response
```

---

# 8. Prompt Engineering

Prompt engineering means designing prompts to improve AI responses.

---

# Prompt Structure

A good prompt contains:

## 1. Instruction
What AI should do.

## 2. Input Data
Question or information.

## 3. Context
Additional knowledge.

## 4. Output Format
Expected response structure.

---

# Prompt Example

```text
You are a senior software engineer.
Explain RAG in simple words.
Return answer in bullet points.
```

---

# Prompting Techniques

## Zero-Shot Prompting
No examples provided.

---

## Few-Shot Prompting
Examples are provided.

---

## Chain-of-Thought Prompting
AI reasons step-by-step.

Example:

```text
Think step by step.
```

---

## Role Prompting
Assigning a role to AI.

```text
You are a cybersecurity expert.
```

---

# 9. LLM Parameters

# Temperature

Controls randomness.

| Low Temperature | High Temperature |
|---|---|
| Accurate | Creative |
| Predictable | Random |
| Stable | Diverse |

---

# Top-P

Controls probability sampling.

---

# Max Tokens

Limits response size.

---

# Frequency Penalty

Reduces repeated words.

---

# Presence Penalty

Encourages exploring new topics.

---

# Parameter Flow

```text
Prompt
   ↓
Temperature
Top-P
Max Tokens
Penalties
   ↓
LLM Response
```

---

# 10. Structured Outputs

Ensuring AI returns predictable responses.

---

# Methods

## Prompt-Based Formatting

```text
Return answer in JSON.
```

---

## JSON Mode

```json
{
  "name": "Ali",
  "role": "Developer"
}
```

---

## JSON Schema

Defines structure validation.

---

## Instructor Libraries

Automatic validation for AI outputs.

---

# 11. Tool Calling / Function Calling

LLMs can use external tools.

---

# Examples of Tools

- Web Search
- Calculator
- APIs
- Databases
- Calendar
- File systems
- Email tools

---

# Tool Calling Workflow

```text
User Query
    ↓
LLM decides tool needed
    ↓
Tool/API execution
    ↓
Tool result returned
    ↓
LLM generates final response
```

---

# Example

```text
User:
"What is the weather today?"

LLM:
Uses weather API
```

---

# Tool Calling vs RAG

| Tool Calling | RAG |
|---|---|
| Executes actions | Retrieves information |
| Uses APIs/tools | Uses vector DB |
| Dynamic operations | Semantic retrieval |

---

# 12. Retrieval-Augmented Generation (RAG)

RAG allows AI to answer questions using external/private knowledge.

---

# Why RAG?

Without RAG:
- limited pretrained knowledge
- outdated information

With RAG:
- company knowledge
- PDFs
- private data
- real-time retrieval

---

# RAG Architecture

```text
Documents
    ↓
Chunking
    ↓
Embeddings
    ↓
Vector Database
    ↓
Similarity Search
    ↓
Relevant Chunks
    ↓
LLM
    ↓
Final Response
```

---

# RAG Query Flow

```text
User Question
      ↓
Generate Query Embedding
      ↓
Vector Similarity Search
      ↓
Retrieve Relevant Chunks
      ↓
Inject Context into Prompt
      ↓
Send to LLM
      ↓
Generate Response
```

---

# 13. Similarity Search

Similarity search finds information based on meaning instead of exact keywords.

---

# Example

```text
"vacation policy"
≈
"leave rules"
```

---

# Semantic Search

Traditional search:
- exact keywords

Semantic search:
- meaning-based search

---

# Similarity Search Flow

```text
Query Embedding
      ↓
Compare with stored vectors
      ↓
Find nearest vectors
      ↓
Return relevant chunks
```

---

# 14. Embeddings

Embeddings are numerical vector representations of meaning.

---

# Embedding Example

```text
"cat" → [0.12, -0.44, 0.88 ...]
```

Similar meanings have similar vectors.

---

# Embedding Analogy

Think of embeddings as coordinates in AI space.

Similar concepts are close together.

---

# Embedding Clusters

```text
Animals Cluster:
cat, dog, cow

Nature Cluster:
tree, flower, forest
```

---

# Embedding Workflow

```text
Text Chunk
     ↓
Embedding Model
     ↓
Vector Representation
```

---

# Common Embedding Models

- OpenAI Embeddings
- BGE
- E5
- MiniLM
- Instructor XL

---

# 15. Vector Databases

Vector databases store embeddings.

---

# Examples

- Pinecone
- ChromaDB
- Weaviate
- Qdrant
- Milvus

---

# Why Vector Databases?

Normal databases:
- exact matching

Vector databases:
- semantic similarity search

---

# Vector DB Workflow

```text
Embeddings
    ↓
Vector Database
    ↓
Similarity Search
    ↓
Relevant Results
```

---

# Vector Indexing

Used for fast vector search.

Algorithms:
- KNN
- ANN
- HNSW

---

# KNN (K-Nearest Neighbors)

Finds closest vectors based on distance.

---

# 16. Chunking Strategies

Chunking means splitting large documents into smaller pieces.

---

# Why Chunking?

LLMs cannot process huge documents efficiently.

---

# Types of Chunking

## Fixed Chunking
Fixed-size chunks.

---

## Recursive Chunking
Splits text intelligently.

---

## Semantic Chunking
Chunks based on meaning.

---

# Chunking Workflow

```text
Large PDF
    ↓
Chunking
    ↓
Small Chunks
```

---

# 17. Data Types

# Structured Data

Examples:
- tables
- employee records
- spreadsheets

---

# Unstructured Data

Examples:
- PDFs
- emails
- policies
- images
- audio

---

# 18. LangChain

LangChain is a framework for building:
- RAG systems
- AI agents
- memory systems
- workflows

---

# LangChain Components

- Chains
- Agents
- Memory
- Retrievers
- Tools
- Output parsers

---

# LangChain Workflow

```text
User Input
    ↓
Retriever
    ↓
LLM
    ↓
Tools
    ↓
Response
```

---

# 19. AI Agents

AI agents are systems capable of:
- reasoning
- planning
- decision making
- tool usage
- autonomous workflows

---

# Agent Workflow

```text
Goal
   ↓
Reasoning
   ↓
Choose Tool
   ↓
Execute Action
   ↓
Observe Result
   ↓
Generate Output
```

---

# Multi-Agent Systems

Different agents handle different tasks.

Examples:
- retrieval agent
- summarization agent
- research agent
- coding agent

---

# 20. MCP (Model Context Protocol)

MCP standardizes communication between:
- LLMs
- tools
- applications

---

# MCP Purpose

Allows AI to interact with:
- GitHub
- VS Code
- databases
- APIs
- file systems

---

# 21. Hallucinations

Hallucinations occur when AI generates incorrect information confidently.

---

# Causes

- missing context
- weak prompts
- outdated training data

---

# Solutions

- RAG
- citations
- validation
- guardrails
- retrieval systems

---

# 22. Guardrails

Guardrails are restrictions and validation rules for AI outputs.

---

# Examples

- content filtering
- JSON validation
- toxicity prevention
- response restrictions

---

# 23. Streaming Responses

Streaming generates responses token-by-token.

Like ChatGPT typing effect.

---

# Streaming Workflow

```text
LLM
   ↓
Token 1
Token 2
Token 3
   ↓
Live Response
```

---

# 24. Memory Systems

# Short-Term Memory

Current conversation context.

---

# Long-Term Memory

Persistent user/history knowledge.

---

# Memory Flow

```text
Conversation
     ↓
Memory Storage
     ↓
Future Retrieval
```

---

# 25. Fine-Tuning

Fine-tuning means training an existing model on custom data.

---

# Fine-Tuning Use Cases

- company-specific assistants
- medical AI
- legal AI
- coding assistants

---

# Fine-Tuning vs RAG

| Fine-Tuning | RAG |
|---|---|
| Changes model behavior | Retrieves knowledge |
| Expensive | Faster |
| Permanent learning | Dynamic retrieval |

---

# 26. AI Evaluation

Testing AI system quality.

---

# Metrics

- accuracy
- hallucinations
- latency
- retrieval quality
- response relevance
- token usage

---

# 27. Full Enterprise RAG Workflow

```text
User Uploads Documents
          ↓
Document Parsing
          ↓
Chunking
          ↓
Embedding Generation
          ↓
Store in Vector Database
          ↓
────────────────────────
          ↓
User Asks Question
          ↓
Generate Query Embedding
          ↓
Similarity Search
          ↓
Retrieve Relevant Chunks
          ↓
Inject Context into Prompt
          ↓
LLM Inference
          ↓
Tool Calling (Optional)
          ↓
Final AI Response
```

---

# 28. Enterprise AI Architecture

```text
                 ┌─────────────────────┐
                 │   Frontend Client   │
                 │ React / Next.js UI  │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Backend API Server  │
                 │ Node.js / Express   │
                 └──────────┬──────────┘
                            │
          ┌─────────────────┴─────────────────┐
          │                                   │
          ▼                                   ▼
┌──────────────────┐              ┌──────────────────┐
│ Retrieval Engine │              │ Authentication   │
│ Similarity Search│              │ JWT / Sessions   │
└────────┬─────────┘              └──────────────────┘
         │
         ▼
┌──────────────────┐
│ Vector Database  │
│ Pinecone/Chroma  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Embedding Model  │
│ OpenAI/BGE       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Document Pipeline│
│ PDF/TXT/DOCX     │
└──────────────────┘
```

---

# 29. Interview Notes

# What is RAG?

RAG (Retrieval-Augmented Generation) is an AI architecture that retrieves relevant information from external knowledge sources and injects it into the LLM prompt before generating a response.

---

# What are embeddings?

Embeddings are vector representations of text meaning used for semantic similarity search.

---

# What is semantic search?

Semantic search retrieves information based on meaning rather than exact keywords.

---

# Difference Between LLM and Embedding Model

| Embedding Model | LLM |
|---|---|
| Converts meaning into vectors | Generates text |
| Used for retrieval | Used for responses |
| Lightweight | Large model |

---

# What is tool calling?

Tool calling allows an LLM to dynamically use external tools such as APIs, web search, databases, or calculators.

---

# Difference Between Agents and RAG

| RAG | Agents |
|---|---|
| Retrieves information | Makes decisions |
| Uses vector DB | Uses reasoning |
| Context retrieval | Autonomous workflows |

---

# 30. Resume Keywords

- Generative AI
- Large Language Models (LLMs)
- Retrieval-Augmented Generation (RAG)
- Semantic Search
- Vector Embeddings
- Prompt Engineering
- LangChain
- AI Agents
- Tool Calling
- Vector Databases
- Pinecone
- ChromaDB
- LLM Orchestration
- Similarity Search
- Context Injection
- AI Workflows
- Agentic AI
- MCP
- Hybrid Retrieval
- Reranking

---

# Resume Summary Example

Learned and implemented core Generative AI concepts including LLMs, prompt engineering, embeddings, vector databases, semantic search, Retrieval-Augmented Generation (RAG), tool calling, and AI agent workflows while building enterprise-style AI applications.

---

# Final Complete Flow

```text
                  ┌─────────────────────┐
                  │   User Question     │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Prompt Engineering  │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Query Embedding     │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Similarity Search   │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Retrieve Context    │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ LLM Inference       │
                  └──────────┬──────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
                  ▼                     ▼
        ┌────────────────┐   ┌────────────────┐
        │ Tool Calling   │   │ Memory System  │
        └────────┬───────┘   └────────┬───────┘
                 │                    │
                 └────────┬───────────┘
                          ▼
               ┌─────────────────────┐
               │ Final AI Response   │
               └─────────────────────┘
```

---

# End of Notes

