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

@app.route('/seekerdash')
def seeker_dashboard():
    return render_template('seekerdash.html')

@app.route('/providerdash')
def provider_dashboard():
    return render_template('providerdash.html')

@app.route('/seeker/<username>/profile')
def seeker_profile(username):
    return render_template('seekerprofile.html', username=username)

@app.route('/seeker/<username>/profileview')
def seeker_profile_view(username):
    return render_template('seekerprofileview.html', username=username)

@app.route('/provider/<username>/profile')
def provider_profile(username):
    return render_template('providerprofile.html', username=username)

@app.route('/provider/<username>/profileview')
def provider_profile_view(username):
    return render_template('providerprofileview.html', username=username)

if __name__ == '__main__':
    app.run(debug=True)