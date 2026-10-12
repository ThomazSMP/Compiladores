from fastapi import FastAPI

app = FastAPI(title="Software Educacional - Backend")


@app.get("/api/hello")
def hello():
    """Endpoint mínimo que comprova que o backend está respondendo."""
    return {"message": "Hello, World!"}
