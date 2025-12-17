import { connect, disconnect } from 'mongoose';
import { config } from 'dotenv';
import { User, UserSchema } from '../src/database/schemas/user.schema';
import { Movie, MovieSchema } from '../src/database/schemas/movie.schema';
import { TVShow, TVShowSchema } from '../src/database/schemas/tvshow.schema';
import { MyListItem, MyListItemSchema } from '../src/database/schemas/my-list-item.schema';
import { model } from 'mongoose';

// Load environment variables
config();

async function seedData() {
  const mongoUri = process.env.MONGO_URI;
  
  if (!mongoUri) {
    console.error('❌ MONGO_URI not found in environment variables');
    process.exit(1);
  }
  
  console.log('🔌 Connecting to MongoDB Atlas...');
  await connect(mongoUri);
  
  const UserModel = model(User.name, UserSchema);
  const MovieModel = model(Movie.name, MovieSchema);
  const TVShowModel = model(TVShow.name, TVShowSchema);
  const MyListItemModel = model(MyListItem.name, MyListItemSchema);

  console.log('🧹 Clearing existing data...');
  // Clear existing data
  await Promise.all([
    UserModel.deleteMany({}),
    MovieModel.deleteMany({}),
    TVShowModel.deleteMany({}),
    MyListItemModel.deleteMany({})
  ]);

  // Seed users
  const users = await UserModel.insertMany([
    {
      username: 'testuser1',
      preferences: {
        favoriteGenres: ['Action', 'SciFi'],
        dislikedGenres: ['Horror']
      },
      watchHistory: []
    },
    {
      username: 'testuser2',
      preferences: {
        favoriteGenres: ['Comedy', 'Romance'],
        dislikedGenres: ['Action']
      },
      watchHistory: []
    }
  ]);

  // Seed movies
  const movies = await MovieModel.insertMany([
    {
      title: 'The Matrix',
      description: 'A computer hacker learns about the true nature of reality.',
      genres: ['Action', 'SciFi'],
      releaseDate: new Date('1999-03-31'),
      director: 'The Wachowskis',
      actors: ['Keanu Reeves', 'Laurence Fishburne']
    },
    {
      title: 'Inception',
      description: 'A thief who steals corporate secrets through dream-sharing technology.',
      genres: ['Action', 'SciFi'],
      releaseDate: new Date('2010-07-16'),
      director: 'Christopher Nolan',
      actors: ['Leonardo DiCaprio', 'Marion Cotillard']
    },
    {
      title: 'The Dark Knight',
      description: 'Batman faces the Joker in this epic superhero thriller.',
      genres: ['Action', 'Drama'],
      releaseDate: new Date('2008-07-18'),
      director: 'Christopher Nolan',
      actors: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart']
    },
    {
      title: 'Pulp Fiction',
      description: 'Interconnected stories of crime and redemption.',
      genres: ['Drama'],
      releaseDate: new Date('1994-10-14'),
      director: 'Quentin Tarantino',
      actors: ['John Travolta', 'Samuel L. Jackson', 'Uma Thurman']
    },
    {
      title: 'The Avengers',
      description: 'Superheroes unite to save the world.',
      genres: ['Action', 'SciFi'],
      releaseDate: new Date('2012-05-04'),
      director: 'Joss Whedon',
      actors: ['Robert Downey Jr.', 'Chris Evans', 'Scarlett Johansson']
    },
    {
      title: 'Titanic',
      description: 'A love story aboard the doomed ship.',
      genres: ['Romance', 'Drama'],
      releaseDate: new Date('1997-12-19'),
      director: 'James Cameron',
      actors: ['Leonardo DiCaprio', 'Kate Winslet']
    }
  ]);

  // Seed TV shows
  const tvShows = await TVShowModel.insertMany([
    {
      title: 'Breaking Bad',
      description: 'A high school chemistry teacher turned methamphetamine producer.',
      genres: ['Drama'],
      episodes: [
        {
          episodeNumber: 1,
          seasonNumber: 1,
          releaseDate: new Date('2008-01-20'),
          director: 'Vince Gilligan',
          actors: ['Bryan Cranston', 'Aaron Paul']
        }
      ]
    },
    {
      title: 'Game of Thrones',
      description: 'Epic fantasy series about power struggles in Westeros.',
      genres: ['Fantasy', 'Drama'],
      episodes: [
        {
          episodeNumber: 1,
          seasonNumber: 1,
          releaseDate: new Date('2011-04-17'),
          director: 'Tim Van Patten',
          actors: ['Sean Bean', 'Peter Dinklage', 'Lena Headey']
        }
      ]
    },
    {
      title: 'Stranger Things',
      description: 'Kids in a small town encounter supernatural forces.',
      genres: ['SciFi', 'Horror'],
      episodes: [
        {
          episodeNumber: 1,
          seasonNumber: 1,
          releaseDate: new Date('2016-07-15'),
          director: 'The Duffer Brothers',
          actors: ['Millie Bobby Brown', 'Finn Wolfhard', 'David Harbour']
        }
      ]
    },
    {
      title: 'The Office',
      description: 'Mockumentary about office workers at Dunder Mifflin.',
      genres: ['Comedy'],
      episodes: [
        {
          episodeNumber: 1,
          seasonNumber: 1,
          releaseDate: new Date('2005-03-24'),
          director: 'Ken Kwapis',
          actors: ['Steve Carell', 'John Krasinski', 'Jenna Fischer']
        }
      ]
    },
    {
      title: 'Friends',
      description: 'Six friends navigate life and relationships in New York City.',
      genres: ['Comedy', 'Romance'],
      episodes: [
        {
          episodeNumber: 1,
          seasonNumber: 1,
          releaseDate: new Date('1994-09-22'),
          director: 'James Burrows',
          actors: ['Jennifer Aniston', 'Courteney Cox', 'Lisa Kudrow']
        }
      ]
    }
  ]);

  // Seed some initial My List items for testing
  console.log('🎬 Seeding My List items...');
  const myListItems = await MyListItemModel.insertMany([
    {
      userId: users[0]._id,
      contentId: movies[0]._id,
      contentType: 'movie',
    },
    {
      userId: users[0]._id,
      contentId: tvShows[0]._id,
      contentType: 'tvshow',
    },
    {
      userId: users[1]._id,
      contentId: movies[1]._id,
      contentType: 'movie',
    }
  ]);

  console.log('✅ Data seeded successfully!');
  console.log(`👥 Users: ${users.length}`);
  console.log(`🎬 Movies: ${movies.length}`);
  console.log(`📺 TV Shows: ${tvShows.length}`);
  console.log(`📋 My List Items: ${myListItems.length}`);
  
  console.log('\n📋 Sample IDs for Postman testing:');
  console.log(`User 1 ID: ${users[0]._id}`);
  console.log(`User 2 ID: ${users[1]._id}`);
  console.log('\n🎬 Movie IDs:');
  movies.forEach((movie, index) => console.log(`${movie.title}: ${movie._id}`));
  console.log('\n📺 TV Show IDs:');
  tvShows.forEach((show, index) => console.log(`${show.title}: ${show._id}`));
  
  await disconnect();
}

seedData().catch(console.error);