from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/seekerlogin')
def seeker_login():
    return render_template('seekerlogin.html')

@app.route('/providerlogin')
def provider_login():
    return render_template('providerlogin.html')

@app.route('/seekersignup')
def seeker_signup():
    return render_template('seekersignup.html')

@app.route('/providersignup')
def provider_signup():
    return render_template('providersignup.html')

if __name__ == '__main__':
    app.run(debug=True)