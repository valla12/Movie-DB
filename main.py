from flask import *
from flask_cors import *
from flask_sqlalchemy import SQLAlchemy
import requests

app = Flask(__name__)
api = "https://www.omdbapi.com/?t="
key = "&apikey=a45df339"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///movies.db"
db = SQLAlchemy(app)

CORS(app)


@app.route('/',methods=['GET'])
def home():
    from home_DB import Movie
    movies = Movie.query.all()
    res = []
    for m in movies:
        res.append({"name":m.name,"year":m.year,"poster":m.poster})
    return jsonify(res)


@app.route('/<name>',methods = ['GET'])
def get_movie(name):
    from home_DB import Movie
    res = requests.get(api + name + key)
    data = res.json()

    if data.get("Response") == "False":
        return jsonify({"error": "Movie not found"}), 404

    existing = Movie.query.filter_by(name=data["Title"]).first()
    if not existing:
        mov = Movie(data["Title"],data["Year"],data["Poster"])
        mov.add_movie()
    return jsonify({"Title":data.get("Title"),"actors":data.get("Actors"),"director":data.get("Director"),"year":data.get("Year"),"poster":data.get("Poster"),"title":data.get("Title"),"plot":data.get("Plot"),"imdbRating":data.get("imdbRating"),"genre":data.get("Genre")})


@app.route('/watch_later/<name>',methods = ["POST"])
def watch_later(name):
    from home_DB import WatchLater
    res = requests.get(api+name+key)
    data = res.json()
    if data.get("Response") == "False":
        return jsonify({"error": "Movie not found"}), 404
    
    existing = WatchLater.query.filter_by(name=data["Title"]).first()
    if not existing:
        mov = WatchLater(data["Title"],data["Year"],data["Poster"])
        mov.add_movie()
    return jsonify({"message":"Movie added to wishlist"})
    

@app.route('/watch_later', methods=['GET'])
def get_watch_later():
    from home_DB import WatchLater
    movies = WatchLater.query.all()
    res = []
    for m in movies:
        res.append({"name":m.name, "year":m.year, "poster":m.poster})
    return jsonify(res)



if __name__ == '__main__':
    with app.app_context():
        from home_DB import WatchLater
        db.create_all()  
    app.run(debug=True)
