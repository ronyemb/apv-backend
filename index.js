import express from 'express';
import conectarDB from './config/db.js';
import dotenv from 'dotenv';
import veterinarioRoutes from './routes/veterinarioRoutes.js';
import pacienteRoutes from './routes/pacienteRoutes.js';
import cors from 'cors';

const app = express();

app.use(express.json());

dotenv.config();

conectarDB();

const dominiosPermitidos = [process.env.FRONTEND_URL];
console.log(dominiosPermitidos);
const corsOptions = {
    origin: function(origin, callback){
        if(dominiosPermitidos.indexOf(origin) !== -1){
            //El origen del request esta permitido
            callback(null, true);
        }else{
            callback(new Error('No permitido por CORS'), true);
        }
    }
};

app.use(cors(corsOptions));

app.use('/api/veterinarios', veterinarioRoutes);
app.use('/api/pacientes', pacienteRoutes);

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Servidor funcionando en el puerto ${port}`);
});

