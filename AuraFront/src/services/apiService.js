//url base del api
const API_URL = 'http://localhost:3000';

//iniciar sesión
export const login = async (loginData) => {
  try {
    const response = await fetch(`${API_URL}/profesor/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      throw new Error('Error en la autenticación');
    }

    const data = await response.json();
    
    localStorage.setItem('access_token', data.token);
    localStorage.setItem('userId', data.profe.id_profesor);


    return data;  
  } catch (error) {
    throw new Error('Error al conectarse con el servidor');
  }
};

//horario del profesor
export const getHorarioByProfesor = async (requestData) => {
  try {
    const response = await fetch(`${API_URL}/profesor/horario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error('Error fetching schedule data');
    }

    const responseData = await response.json();

    if (responseData.statusCode === 200) {
      return responseData.data; 
    } else {
      throw new Error(responseData.message || 'Unexpected error');
    }
  } catch (error) {
    throw new Error(error.message || 'Error connecting to the server');
  }
};

//detalles del curso
export const getCursoById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/curso/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Error al obtener el curso');
    }

    const data = await response.json();

    if (data.message === 'Curso hallado') {
      return data.curso;
    } else {
      throw new Error('Curso no encontrado');
    }
  } catch (error) {
    throw new Error('Error al conectarse con el servidor');
  }
};

// cursos del profesor
export const getCoursesByProfessorId = async (idProf) => {
  try {
    const response = await fetch(`${API_URL}/profesor/cursos/${idProf}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Error en la autenticación');
    }

    const data = await response.json();

    if (data.message === 'Cursos encontrados') {
      return data.cursos;
    } else {
      throw new Error('Cursos no encontrados');
    }
  } catch (error) {
    throw new Error('Error al conectarse con el servidor');
  }
};

//modificar asistencias
export const updateAsistencias = async (data) => {
  const response = await fetch(`${API_URL}/asistencia/actualizar`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al actualizar asistencias: ${response.status} - ${errorText}`);
  }

  return await response.json();
};

//obtener asistencias
export const getAsistencias = async (params) => {
  const response = await fetch(`${API_URL}/asistencia/por-fecha`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  return await response.json();
};

// Obtener faltas por fecha
export const obtenerFaltasPorFecha = async (profesorId, cursoId, fecha = null) => {
  try {
    const body = { profesorId, cursoId };
    
    // Solo añadir `fecha` si está definido
    if (fecha) {
      body.fecha = fecha;
    }

    const response = await fetch(`${API_URL}/asistencia/faltas-fecha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Error al obtener faltas por fecha');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Error al conectarse con el servidor');
  }
};


// Obtener porcentaje de faltas
export const obtenerPorcentajeFaltas = async (enviar) => {
  try {
    const response = await fetch(`${API_URL}/asistencia/porcentaje-faltas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enviar),
    });

    if (!response.ok) {
      throw new Error('Error al obtener porcentaje de faltas');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Error al conectarse con el servidor');
  }
};

// Obtener fechas de asistencia
export const getFechasAsistencia = async (profesorId, cursoId) => {
  try {
    const response = await fetch(`${API_URL}/asistencia/fechas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profesor_id: profesorId, curso_id: cursoId }),
    });

    if (!response.ok) {
      throw new Error('Error al obtener fechas de asistencia');
    }

    const data = await response.json();

    if (data.fechas) {
      return data.fechas;
    } else {
      throw new Error('Fechas no encontradas');
    }
  } catch (error) {
    throw new Error(error.message || 'Error al conectarse con el servidor');
  }
};

// Registrar asistencia
export const registrarAsistencia = async (data) => {
  try {
    const response = await fetch(`${API_URL}/asistencia/registrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al registrar asistencia: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();

    if (responseData.message === 'Asistencia registrada correctamente') {
      return responseData.asistencias;
    } else {
      throw new Error('Error al registrar asistencia');
    }
  } catch (error) {
    throw new Error(error.message || 'Error al conectarse con el servidor');
  }
};