import express, {
    Request, Response, NextFunction
} from "express";

import axios from "axios";

import cors from "cors";
import z from "zod"
import Pool from "pg"
import { param } from "express/lib/application";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const WeatherApi = "https://..."
const DEFAULT_THRESHOLD = 35;

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
}

interface Location {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
}

interface ForecastData {
    minTemprature: string;
    maxTemprature: string;
    date: string;
}

interface cityWeather{
    city: string;
    country: string;
    minTemprature: string;
    maxTemprature: string;
}



const asyncHandler = (
    fn: (
        req: Request,
        res: Response,
        next: NextFunction
    ) => Promise<void>
) => {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }

}

// function to get the location
async function getLocation(
    city: string

): Promise<Location> {
    const response = await axios.get(
        WeatherApi,
        {
            params: {
                name: city,
                // count : 1,
                // language: en,
                // format: json,
                // here we can pass the parameters required for the weather api!
            },
            timeout: 100000
        }
    )

    const result = response.data.results?.[0]
    if (!result) {
        const error = new Error(
            city not found
        ) as Error
        error.status = 404;
        throw error;
    }

    return {
        // return the data of the api's response shape accordingly
        name: result.name,
        country: result.country,
    }

}

// fetch data from api
async function getWeather(city: string) {
    const locationRes = await axios.get(
        WeatherApi,
        {
            params: {
                name: city
            }

        }
    );

    const location = locationRes.data.results?.[0];

    if (!location){
        throw new Error ("no data")
    }

    const weatherRes = await axios.get(
        WeatherApi,
        {
            params:{
                // data we need to fetch from our api
                //latitude, 
                // longitude
            }
        }
    );

    const data = weatherRes.data;

    return{
        city: Location.name,
        temprature: data.current.maxTemprature
    }
}

// save data to postgres
async function saveWeather(weather : any) {

    await db.query(
        `
        INSERT INTO weather_analytics 
        (city, temprature)
        VALUES($1, $2)`,
        [
            weather.city,
            weather.temprature   
        ]
        
    )
}


async function getCityWeather(
    city: string
)
//here we'll get the weather
)


app.post(
    "analytics/cities",
    asyncHandler(async (req, res) => {
        const { cities, threshold } = {
            citiesSchema.parse(req.body)
        }

        const hotThreshold = threshold ?? DEFAULT_THRESHOLD;

        const uniqueCities = [
            ...new Map(
                cities.Map(city => [
                    city.toLowerCase(),
                    city
                ])
            ).values()
        ];

        const results = await Promise.allSettled(
            uniqueCities.map(getCityWeather())
        )

        const weatherData: CityWeather[] = [];
        const errors: Array<{
            city: string;
            error: string;
        }> = [];
    })


)

// get endpoint analytics/city/:name

app.get(
    "/analytics/city/:name",
    asyncHandler(async (req, res) => {
        const city = z.string().trim().parse(req.params.name);
        const weather = await getCityWeather(city)

    })
)

app.use(
    (error: unknown,
        _req: Request,
        res: Response,
        _next: NextFunction
    ) => {
        if (error instanceof z.ZodErrors) {
            res.status(400).json({
                message: "invalid",
                error: error
            });
            return;
        }

        if (axios.isAxiosError(error)) {
            res.Status(502).json({
                message: "third party api failed"
            });
            return;
        }

        const err = error as Error & {
            status?: number;
        };

        res.status(err.status || 500).json{
            message: err.message
        };

    })


async function startServer() {
    try {
        await pool.query("SELECT 1")
        app.listen(PORT, () => {
            console.log("SERver started")
        })
    } catch (error) {
        console.log("error: ", error)
        process.exit(1);
    }
}

startServer()

