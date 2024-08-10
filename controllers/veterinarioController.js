import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarID from "../helpers/generarID.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

const registrar = async (req, res) => {

    const {email, nombre} = req.body;

    const existeUsuario = await Veterinario.findOne({email});

    if(existeUsuario){
        const error = new Error('Usuario ya registrado');

        return res.status(400).json({msg: error.message});
    }

    try {
        //Guardar un nuevo veterinario
        const veterinario = new Veterinario(req.body);
        const veternarioGuardado = await veterinario.save();

        //Enviar el Email
        emailRegistro({email, nombre, token:veternarioGuardado.token});

        res.json(veternarioGuardado);

    } catch (error) {
        console.log(error);
    }

    
};

const perfil = (req, res) => {
    const { veterinario } = req;
 
    res.json( veterinario );
};

const confirmar = async (req, res) => {

    const { token } = req.params;
    const usuarioConfirmar = await Veterinario.findOne({token});

    if(!usuarioConfirmar){
        const error = new Error('Token no válido');
        return res.status(404).json({msg: error.message});
    }

    try {
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        await usuarioConfirmar.save();

        res.json({
            msg: 'Usuario confirmado correctamente'
        });

    } catch (error) {
        console.log(error);
    }
}

const autenticar = async (req, res) => {
    const { email, password } = req.body;
    const usuario = await Veterinario.findOne({email});
    //comprobar si el usuario existe
    if(!usuario){
        const error = new Error('El usuario no existe');
        return res.status(404).json({msg: error.message});
    };
    //comprobar si el usuario esta confirmado
    if(!usuario.confirmado){
        const error = new Error('Tu cuenta no ha sido confirmada');
        return res.status(403).json({msg: error.message});
    };
    //revisar el password
    if(await usuario.comprobarPassword(password)){
    //    console.log(usuario) 
    //    console.log(usuario.id) 
    //    console.log(usuario._id) 
       //auntenticar
       res.json({
        _id:usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        web: usuario.web,
        telefono: usuario.telefono,
        token: generarJWT(usuario.id)
       });
    }else {
        const error = new Error('El password es incorrecto');
        return res.status(403).json({msg: error.message});
    }    
}

const olvidePassword = async (req, res) => {
    const { email } = req.body;
    const existeVeterinario = await Veterinario.findOne({email});

    if(!existeVeterinario){
        const error = new Error('El usuario no existe');
        return res.status(400).json({msg: error.message});
    }

    try {
        existeVeterinario.token = generarID();
        await existeVeterinario.save();

        emailOlvidePassword({
            email,
            nombre: existeVeterinario.nombre,
            token: existeVeterinario.token
        });

        res.json({msg: "Hemos enviado un email con las instrucciones"});
    } catch (error) {
        console.log(error)
    }
    
}

const comprobarToken = async (req, res) => {
    const {token} = req.params;

    const tokenValido = await Veterinario.findOne({token});

    if(tokenValido){
        res.json({msg: "Token válido"});
    }else{
        const error = new Error('El token no es valido');
        return res.status(400).json({msg: error.message});
    }  
}

const nuevoPassword = async (req, res) => {

    const {token} = req.params;
    const { password } = req.body;
    const veterinario = await Veterinario.findOne({token});

    if(!veterinario){
        const error = new Error('Hubo un error');
        return res.status(400).json({msg: error.message});
    }
    
    try {
        veterinario.token = null;
        veterinario.password = password;
        await veterinario.save();
        res.json({msg: "Password actualizado correctamente"});
    } catch (error) {
        console.log(error)
    }    
    
}

const actualizarPerfil = async (req, res) => {
    const veterinario = await Veterinario.findById(req.params.id);
    if (!veterinario) {
      const error = new Error("Hubo un error");
      return res.status(400).json({ msg: error.message });
    }
  
    const { email } = req.body;
    if (veterinario.email !== req.body.email) {
      const existeEmail = await Veterinario.findOne({ email });
  
      if (existeEmail) {
        const error = new Error("Ese email ya esta en uso");
        return res.status(400).json({ msg: error.message });
      }
    }
  
    try {
      veterinario.nombre = req.body.nombre;
      veterinario.email = req.body.email;
      veterinario.web = req.body.web;
      veterinario.telefono = req.body.telefono;
  
      const veterianrioActualizado = await veterinario.save();
      res.json(veterianrioActualizado);
    } catch (error) {
      console.log(error);
    }
  };
  
  const actualizarPassword = async (req, res) => {
    // Leer los datos
    const { id } = req.veterinario;
    const { pwd_actual, pwd_nuevo } = req.body;
  
    // Comprobar que el veterinario existe
    const veterinario = await Veterinario.findById(id);
    if (!veterinario) {
      const error = new Error("Hubo un error");
      return res.status(400).json({ msg: error.message });
    }
  
    // Comprobar su password
    if (await veterinario.comprobarPassword(pwd_actual)) {
      // Almacenar el nuevo password
  
      veterinario.password = pwd_nuevo;
      await veterinario.save();
      res.json({ msg: "Password Almacenado Correctamente" });
    } else {
      const error = new Error("El Password Actual es Incorrecto");
      return res.status(400).json({ msg: error.message });
    }
  };
  
  export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword,
  };