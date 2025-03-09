from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")  # Renderiza la página principal

@app.route("/censo")
def censo():
    return render_template("censo.html")  # Renderiza la página del censo

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)  # Servir en la red local
