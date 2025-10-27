import { Mystery } from './types';

export interface MysteryDefinition {
  mystery: Mystery;
  answer: string;
  hints: string[];
}

// Mystery pool with different difficulties
export const mysteryPool: MysteryDefinition[] = [
  {
    mystery: {
      mysteryId: 'myst_001',
      title: 'The Evolved Enigma',
      difficulty: 'medium',
      scenario: 'A mysterious trainer left behind cryptic notes about their favorite Pokémon. Can you decipher their riddle?',
      clues: [
        {
          id: 'clue_001',
          text: 'Find the second evolution of a rock-type Pokémon whose name ends in \'dore\'. Your answer is the sum of all game_indices for this Pokémon.',
          apiHint: 'You\'ll need to explore the PokéAPI (https://pokeapi.co/docs/v2) to solve this puzzle.',
          solved: false
        }
      ],
      hintsAvailable: 3,
      createdAt: new Date().toISOString()
    },
    answer: '219', // Boldore's game_indices sum
    hints: [
      'Look at the PokéAPI documentation for filtering Pokémon by type. You\'ll need to make multiple API calls.',
      'Use the /type/rock endpoint to get all rock-type Pokémon. Then filter for names ending in \'dore\' and check their evolution chains.',
      'The Pokémon you\'re looking for is Boldore. Get its details from /pokemon/boldore and sum all values in the game_indices array.'
    ]
  },
  {
    mystery: {
      mysteryId: 'myst_002',
      title: 'The Stellar Mystery',
      difficulty: 'easy',
      scenario: 'An astronomer discovered something peculiar about a specific star system. Help decode their findings.',
      clues: [
        {
          id: 'clue_002',
          text: 'Find the number of people currently in space right now. This is your answer.',
          apiHint: 'Check out the Open Notify API (http://api.open-notify.org/astros.json) - no authentication needed!',
          solved: false
        }
      ],
      hintsAvailable: 2,
      createdAt: new Date().toISOString()
    },
    answer: 'dynamic', // This will vary, so we'll handle it specially
    hints: [
      'The Open Notify API has a simple endpoint that returns current astronauts in space.',
      'Make a GET request to http://api.open-notify.org/astros.json and count the people array length.'
    ]
  },
  {
    mystery: {
      mysteryId: 'myst_003',
      title: 'The Weather Whisperer',
      difficulty: 'easy',
      scenario: 'A meteorologist left a coded message about today\'s weather. Can you crack the code?',
      clues: [
        {
          id: 'clue_003',
          text: 'Find the current temperature in Kelvin for London, UK. Round to the nearest integer.',
          apiHint: 'Try the Open-Meteo API (https://open-meteo.com/en/docs) - it\'s free and requires no API key!',
          solved: false
        }
      ],
      hintsAvailable: 3,
      createdAt: new Date().toISOString()
    },
    answer: 'dynamic',
    hints: [
      'Open-Meteo provides weather data. You\'ll need London\'s coordinates: latitude 51.5074, longitude -0.1278',
      'Use the endpoint: https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current_weather=true',
      'The response includes temperature in Celsius. Convert to Kelvin: K = C + 273.15, then round to nearest integer.'
    ]
  },
  {
    mystery: {
      mysteryId: 'myst_004',
      title: 'The Bitcoin Bounty',
      difficulty: 'medium',
      scenario: 'A crypto trader left clues about when they made their fortune. Follow the blockchain trail.',
      clues: [
        {
          id: 'clue_004',
          text: 'Find the current Bitcoin price in USD and round down to the nearest thousand. That\'s your answer.',
          apiHint: 'CoinGecko API (https://www.coingecko.com/en/api) provides free crypto data without authentication.',
          solved: false
        }
      ],
      hintsAvailable: 2,
      createdAt: new Date().toISOString()
    },
    answer: 'dynamic',
    hints: [
      'Use CoinGecko\'s simple price endpoint: https://api.coingecko.com/api/v3/simple/price',
      'Request Bitcoin price with parameters: ?ids=bitcoin&vs_currencies=usd. Then round DOWN to nearest 1000.'
    ]
  },
  {
    mystery: {
      mysteryId: 'myst_005',
      title: 'The GitHub Gumshoe',
      difficulty: 'hard',
      scenario: 'A developer committed evidence in their repository. Can you find the smoking gun?',
      clues: [
        {
          id: 'clue_005',
          text: 'Find the number of public repositories owned by the GitHub user "torvalds". This is your answer.',
          apiHint: 'GitHub\'s REST API (https://docs.github.com/en/rest) is publicly accessible for basic queries.',
          solved: false
        }
      ],
      hintsAvailable: 3,
      createdAt: new Date().toISOString()
    },
    answer: 'dynamic',
    hints: [
      'GitHub API endpoint for user info: https://api.github.com/users/{username}',
      'Make a GET request to https://api.github.com/users/torvalds',
      'Look for the "public_repos" field in the JSON response - that\'s your answer as a string.'
    ]
  },
  {
    mystery: {
      mysteryId: 'myst_006',
      title: 'The RESTful Riddle',
      difficulty: 'easy',
      scenario: 'Someone left a mysterious message in a public API testing service...',
      clues: [
        {
          id: 'clue_006',
          text: 'Make a request to JSONPlaceholder and find the userId of the post with id=50. That\'s your answer.',
          apiHint: 'JSONPlaceholder (https://jsonplaceholder.typicode.com/) is a fake REST API for testing.',
          solved: false
        }
      ],
      hintsAvailable: 2,
      createdAt: new Date().toISOString()
    },
    answer: '5',
    hints: [
      'JSONPlaceholder has a posts endpoint: https://jsonplaceholder.typicode.com/posts',
      'Fetch post with id 50: https://jsonplaceholder.typicode.com/posts/50 and extract the userId field.'
    ]
  }
];

// Helper function to get a random mystery by difficulty
export function getRandomMystery(difficulty?: 'easy' | 'medium' | 'hard'): MysteryDefinition {
  const filtered = difficulty
    ? mysteryPool.filter(m => m.mystery.difficulty === difficulty)
    : mysteryPool;

  const randomIndex = Math.floor(Math.random() * filtered.length);

  // Create a fresh copy with new timestamps and IDs
  const selected = filtered[randomIndex];
  return {
    ...selected,
    mystery: {
      ...selected.mystery,
      createdAt: new Date().toISOString(),
      clues: selected.mystery.clues.map(c => ({ ...c, solved: false }))
    }
  };
}
