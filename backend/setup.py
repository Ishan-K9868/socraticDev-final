"""Setup configuration for the GraphRAG backend."""

from setuptools import setup, find_packages

setup(
    name="graphrag-backend",
    version="0.1.0",
    description="Graph Retrieval-Augmented Generation System Backend",
    author="SocraticDev Team",
    packages=find_packages(where=".", exclude=["tests*"]),
    package_dir={"": "."},
    python_requires=">=3.11",
    install_requires=[
        "fastapi>=0.104.1",
        "uvicorn[standard]>=0.24.0",
        "pydantic>=2.5.0",
        "pydantic-settings>=2.1.0",
    ],
)
