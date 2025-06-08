import express, {Request, Response} from 'express'
import { PrismaClient } from '@prisma/client';
import path from 'path'
import axios from 'axios'

const prisma = new PrismaClient();
const app = express()


app.use(express.json())

// --- Middleware: Request Logger ---
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  })

// --- Create user ---
app.post('/api/users', async (req, res, _) => {
    const {first_name, email, last_name, active, country} = req.body
    try{
        const newUser = await prisma.user.create({
            data: {
                first_name,
                email,
                last_name,
                active,
                country
            },
        });
        res.status(201).json(newUser);
    } catch (err: any) {
        res.status(400).json({error: 'Failed to create user', details: err.message});
    }
})

// --- Get all users ---
app.get('/api/users', async (_req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.delete('/api/users', async (_req, res) => {
  try {
    await prisma.user.deleteMany() // deletes all rows in the User table
    res.status(200).json({ message: 'All users deleted successfully' })
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete users', details: err.message })
  }
})

// --- Get users by country code ---
app.get('/api/users/by-country/:code', async (req, res) => {
    const code = req.params.code.toUpperCase()
    try {
        const users = await prisma.user.findMany({ where: { country: code } });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users by country' });
    }
})

// --- Get duplicate names and their count ---
app.get('/api/users/duplicate-names', async (req, res) => {
    const minCount = parseInt(req.query.count as string) || 2
    const activeFilter = req.query.active

    try {
        const users = await prisma.user.findMany({
        where: activeFilter !== undefined ? { active: activeFilter === 'true' } : {},
        select: {
            first_name: true,
            last_name: true,
        },
        });

        const nameCount: Record<string, number> = {}
        users.forEach(user => {
            const fullName = `${user.first_name} ${user.last_name}`
            nameCount[fullName] = (nameCount[fullName] || 0) + 1
        });

        const duplicates = Object.entries(nameCount)
        .filter(([_, count]) => count >= minCount)
        .map(([fullName, count]) => ({ name: fullName, count }))

        res.json({ duplicates });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch duplicate names', details: err.message });
    }
});

// Cache the weather data to prevent unnecessary API calls
const weatherCache: Record<string, { data: any; timestamp: number }> = {}
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

app.get('/api/weather/:stateCode', async (req: Request<{ stateCode: string }>, res: Response): Promise<void> => {
    const stateCode = req.params.stateCode.toUpperCase();

    const stateCoordinates: Record<string, { lat: number; lon: number }> = {
        WI: { lat: 44.500000, lon: -89.500000 },
        WV: { lat: 39.000000, lon: -80.500000 },
        VT: { lat: 44.000000, lon: -72.699997 },
        TX: { lat: 31.000000, lon: -100.000000 },
        SD: { lat: 44.500000, lon: -100.000000 },
        RI: { lat: 41.742325, lon: -71.742332 },
        OR: { lat: 44.000000, lon: -120.500000 },
        NY: { lat: 43.000000, lon: -75.000000 },
        NH: { lat: 44.000000, lon: -71.500000 },
        NE: { lat: 41.500000, lon: -100.000000 },
        KS: { lat: 38.500000, lon: -98.000000 },
        MS: { lat: 33.000000, lon: -90.000000 },
        IL: { lat: 40.000000, lon: -89.000000 },
        DE: { lat: 39.000000, lon: -75.500000 },
        CT: { lat: 41.599998, lon: -72.699997 },
        AR: { lat: 34.799999, lon: -92.199997 },
        IN: { lat: 40.273502, lon: -86.126976 },
        MO: { lat: 38.573936, lon: -92.603760 },
        FL: { lat: 27.994402, lon: -81.760254 },
        NV: { lat: 39.876019, lon: -117.224121 },
        ME: { lat: 45.367584, lon: -68.972168 },
        MI: { lat: 44.182205, lon: -84.506836 },
        GA: { lat: 33.247875, lon: -83.441162 },
        HI: { lat: 19.741755, lon: -155.844437 },
        AK: { lat: 66.160507, lon: -153.369141 },
        TN: { lat: 35.860119, lon: -86.660156 },
        VA: { lat: 37.926868, lon: -78.024902 },
        NJ: { lat: 39.833851, lon: -74.871826 },
        KY: { lat: 37.839333, lon: -84.270020 },
        ND: { lat: 47.650589, lon: -100.437012 },
        MN: { lat: 46.392410, lon: -94.636230 },
        OK: { lat: 36.084621, lon: -96.921387 },
        MT: { lat: 46.965260, lon: -109.533691 },
        WA: { lat: 47.751076, lon: -120.740135 },
        UT: { lat: 39.419220, lon: -111.950684 },
        CO: { lat: 39.113014, lon: -105.358887 },
        OH: { lat: 40.367474, lon: -82.996216 },
        AL: { lat: 32.318230, lon: -86.902298 },
        IA: { lat: 42.032974, lon: -93.581543 },
        NM: { lat: 34.307144, lon: -106.018066 },
        SC: { lat: 33.836082, lon: -81.163727 },
        PA: { lat: 41.203323, lon: -77.194527 },
        AZ: { lat: 34.048927, lon: -111.093735 },
        MD: { lat: 39.045753, lon: -76.641273 },
        MA: { lat: 42.407211, lon: -71.382439 },
        CA: { lat: 36.778259, lon: -119.417931 },
        ID: { lat: 44.068203, lon: -114.742043 },
        WY: { lat: 43.075970, lon: -107.290283 },
        NC: { lat: 35.782169, lon: -80.793457 },
        LA: { lat: 30.391830, lon: -92.329102 },
    }

    const coords = stateCoordinates[stateCode]
    if (!coords){
        res.status(400).json({ error: 'Unsupported state code' });
        return;
    } 

    const now = Date.now();
    const cached = weatherCache[stateCode];

    // Used cache if state weather checked recently
    if (cached && now - cached.timestamp < CACHE_TTL) {
        res.json(cached.data);
        return;
    }

    try {
        const pointRes = await axios.get(`https://api.weather.gov/points/${coords.lat},${coords.lon}`);
        const forecastUrl = pointRes.data.properties.forecast;
        const forecastRes = await axios.get(forecastUrl);
        
        weatherCache[stateCode] = { data: forecastRes.data, timestamp: now }

        res.json(forecastRes.data);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch weather data', details: err.message });
        if (cached) {
            res.status(200).json({ ...cached.data, warning: 'Stale data due to fetch error' });
        } else {
            res.status(500).json({ error: 'Failed to fetch weather data', details: err.message });
        }
    }
})

app.get('/api/health', (_, res, __) => {
    res.sendStatus(200);
})

// Serve static files from the dist folder
app.use(express.static(path.join(__dirname, '../dist')));

// For Single Page Application (SPA) routing
app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const server = app.listen(3001)

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', {
        message: err.message,
        stack: err.stack,
    })
    server.close(() => {
        console.log('Server Closed')
        void prisma.$disconnect();
        process.exit(1) // Exit the process with a failure code
    })

    // If server.close() doesn't work for some reason, exit immediately
    setTimeout(() => {
        console.log('Forcing process exit');
        void prisma.$disconnect();
        process.exit(1);
    }, 5000); // Force exit after 5 seconds in case server doesn't close
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    server.close(() => {
        console.log('Server Closed')
        void prisma.$disconnect();
        process.exit(1) // Exit the process with a failure code
    })

    // If server.close() doesn't work for some reason, exit immediately
    setTimeout(() => {
        console.log('Forcing process exit');
        void prisma.$disconnect();
        process.exit(1);
    }, 5000); // Force exit after 5 seconds in case server doesn't close
})

process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Cleaning up...');
    server.close(() => {
        console.log('Server Closed')
        void prisma.$disconnect();
        process.exit(0);
    })
})

process.on('SIGINT', () => {
    console.log('Received SIGINT. Cleaning up...');
    server.close(() => {
        console.log('Server Closed')
        void prisma.$disconnect();
        process.exit(0);
    })
})