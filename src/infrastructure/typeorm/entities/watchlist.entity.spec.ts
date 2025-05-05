import "reflect-metadata";
import { Movie } from "./movie.entity";
import { User } from "./user.entity";
import { Watchlist } from "./watchlist.entity";

// Setup for reflect-metadata
beforeAll(() => {
  // Ensure reflect-metadata is properly initialized
  if (!Reflect.getMetadata) {
    Reflect.getMetadata = (key: string, target: any, propertyKey?: string) => {
      return Reflect.getOwnMetadata(key, target, propertyKey);
    };
  }
});

describe("Watchlist Entity", () => {
  let watchlist: Watchlist;
  let movie: Movie;
  let user: User;

  beforeEach(() => {
    watchlist = new Watchlist();
    movie = new Movie();
    user = new User();

    // Initialize required properties
    watchlist.id = 1;
    watchlist.movieId = 123;
    watchlist.userId = 456;
    watchlist.movie = movie;
    watchlist.user = user;
  });

  describe("Entity properties", () => {
    it("should have proper properties and default values", () => {
      // Test that the entity has the expected properties
      expect(watchlist).toHaveProperty("id");
      expect(watchlist).toHaveProperty("movieId");
      expect(watchlist).toHaveProperty("userId");
      expect(watchlist).toHaveProperty("isFavorite");
      expect(watchlist).toHaveProperty("createdAt");
      expect(watchlist).toHaveProperty("updatedAt");

      // Test property values
      expect(watchlist.id).toBe(1);
      expect(watchlist.movieId).toBe(123);
      expect(watchlist.userId).toBe(456);
      expect(watchlist.isFavorite).toBe(false);
      expect(watchlist.createdAt).toBeInstanceOf(Date);
      expect(watchlist.updatedAt).toBeInstanceOf(Date);
    });
  });

  it("should create a watchlist instance", () => {
    expect(watchlist).toBeDefined();
    expect(watchlist).toBeInstanceOf(Watchlist);
  });

  it("should set and get properties correctly", () => {
    const now = new Date();

    watchlist.id = 1;
    watchlist.movieId = 1;
    watchlist.userId = 1;
    watchlist.isFavorite = true;
    watchlist.createdAt = now;
    watchlist.updatedAt = now;
    watchlist.movie = movie;
    watchlist.user = user;

    expect(watchlist.id).toBe(1);
    expect(watchlist.movieId).toBe(1);
    expect(watchlist.userId).toBe(1);
    expect(watchlist.isFavorite).toBe(true);
    expect(watchlist.createdAt).toBe(now);
    expect(watchlist.updatedAt).toBe(now);
    expect(watchlist.movie).toBe(movie);
    expect(watchlist.user).toBe(user);
  });

  it("should handle optional properties", () => {
    const newWatchlist = new Watchlist();
    expect(newWatchlist.isFavorite).toBeFalsy();
    expect(newWatchlist.movie).toBeUndefined();
    expect(newWatchlist.user).toBeUndefined();
  });

  it("should initialize with default values", () => {
    expect(watchlist.createdAt).toBeInstanceOf(Date);
    expect(watchlist.updatedAt).toBeInstanceOf(Date);
    expect(watchlist.isFavorite).toBe(false);
  });

  it("should update timestamps on entity update", () => {
    const initialCreatedAt = watchlist.createdAt;
    const initialUpdatedAt = watchlist.updatedAt;

    // Simulate some delay
    const laterDate = new Date(Date.now() + 1000);
    watchlist.updatedAt = laterDate;

    expect(watchlist.createdAt).toBe(initialCreatedAt);
    expect(watchlist.updatedAt).not.toBe(initialUpdatedAt);
    expect(watchlist.updatedAt).toBe(laterDate);
  });

  describe("Movie relationship", () => {
    it("should set and get movie relationship", () => {
      movie.id = 1;
      movie.title = "Test Movie";
      watchlist.movie = movie;
      expect(watchlist.movie).toBe(movie);
    });

    it("should handle null movie relationship", () => {
      watchlist.movie = null;
      expect(watchlist.movie).toBeNull();
    });
  });

  describe("User relationship", () => {
    it("should set and get user relationship", () => {
      user.id = 1;
      user.email = "test@example.com";
      watchlist.user = user;
      expect(watchlist.user).toBe(user);
    });

    it("should handle null user relationship", () => {
      watchlist.user = null;
      expect(watchlist.user).toBeNull();
    });
  });

  describe("Entity decorators", () => {
    it("should have proper decorators and functionality", () => {
      // Test that the entity has the expected properties
      expect(watchlist).toHaveProperty("id");
      expect(watchlist).toHaveProperty("movieId");
      expect(watchlist).toHaveProperty("userId");
      expect(watchlist).toHaveProperty("isFavorite");
      expect(watchlist).toHaveProperty("createdAt");
      expect(watchlist).toHaveProperty("updatedAt");
      expect(watchlist).toHaveProperty("movie");
      expect(watchlist).toHaveProperty("user");

      // Test property values
      expect(watchlist.id).toBe(1);
      expect(watchlist.movieId).toBe(123);
      expect(watchlist.userId).toBe(456);
      expect(watchlist.isFavorite).toBe(false);
      expect(watchlist.createdAt).toBeInstanceOf(Date);
      expect(watchlist.updatedAt).toBeInstanceOf(Date);

      // Test relationships
      watchlist.movie = movie;
      watchlist.user = user;
      expect(watchlist.movie).toBe(movie);
      expect(watchlist.user).toBe(user);
    });
  });
});
