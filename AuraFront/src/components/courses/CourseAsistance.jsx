import React, { useEffect, useState } from 'react';
import NavbarHeader from '../NavbarHeader';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getAsistencias, updateAsistencias, getCursoById, getFechasAsistencia, obtenerFaltasPorFecha, registrarAsistencia, DetenerRegistroAsistencia } from '../../services/apiService';
import { decryptId } from '../../utils/cryptoUtils';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const CourseAsistance = () => {
  // Importación de parámetros de la URL
  const { idCurso, idProfesor } = useParams();

  // Definición de estados
  const [asistencias, setAsistencias] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [curso, setCurso] = useState(null);
  const [fechas, setFechas] = useState([]);
  const [selectedFecha, setSelectedFecha] = useState('');
  const [selectedSemana, setSelectedSemana] = useState(1);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');
  const [falta, setFalta] = useState('');
  const [fechaHoy, setFechaHoy] = useState('');
  const [showAsistanceModal, setShowAsistanceModal] = useState(false);
  const [takeAsistanceModal, setTakeAsistanceModal] = useState(false);
  const [time, setTime] = useState();
  const [isTakingAsistance, setIsTakingAsistance] = useState(false);
  const [showModalStop, setShowModalStop] = useState(false);
  const [disabledButtonAdd, setDisabledButtonAdd] = useState(false);

  // Desencriptación de IDs de curso y profesor
  const idCur = decryptId(idCurso);
  const idProf = decryptId(idProfesor);

  // Datos
  const datosCurso = {
    cursoId: idCur,
    cursoNom: curso?.nombre || '',
    isTakingAsistance: true
  }

  // Definición de useEFfect
  useEffect(() => {
    const storedIsTakingAsistance = JSON.parse(localStorage.getItem('isTakingAsistance'));
    
    if (storedIsTakingAsistance && storedIsTakingAsistance.isTakingAsistance) {
      if (storedIsTakingAsistance.cursoId === idCur) {
        setIsTakingAsistance(true);
      } else {
        setDisabledButtonAdd(true)
      }
    }
  }, [idCur]); 
  
  useEffect(() => {
    // Obtener la fecha de hoy en formato 'YYYY-MM-DD'
    const fecha = new Date();
    const fechaUTCMinus5 = new Date(fecha.toLocaleString("en-US", { timeZone: "America/Lima" }));
    const año = fechaUTCMinus5.getFullYear();
    const mes = (fechaUTCMinus5.getMonth() + 1).toString().padStart(2, '0');
    const dia = fechaUTCMinus5.getDate().toString().padStart(2, '0');
    const fechaFormateada = `${año}-${mes}-${dia}`;
    setFechaHoy(fechaFormateada);
  }, []);

  useEffect(() => {
    if (!selectedFecha) return;

    // Obtención de faltas para la fecha seleccionada
    const fetchFaltasFecha = async () => {
      try {
        const faltasFecha = await obtenerFaltasPorFecha(idProf, idCur, selectedFecha);
        setFalta(faltasFecha);
      } catch (error) {
        console.error('Error al obtener las faltas:', error);
      }
    };

    fetchFaltasFecha();
  }, [selectedFecha, idProf, idCur]);

  useEffect(() => {
    // Obtención de datos del curso por ID
    const fetchCurso = async () => {
      try {
        const cursoData = await getCursoById(idCur);
        setCurso(cursoData);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchCurso();
  }, [idCur]);

  useEffect(() => {
    // Obtención de fechas iniciales
    const fetchInitialAsistencias = async () => {
      try {
        const json = {
          fecha: "",
          profesorId: idProf,
          cursoId: idCur,
        };

        const response = await getAsistencias(json);
        setAsistencias(response);

        if (response.length > 0 && idProf && idCur) {
          try {
            const fechasData = await getFechasAsistencia(idProf, idCur);
            setFechas(fechasData);

            setSelectedFecha(fechasData[0]);
            setSelectedSemana(1);
          } catch (error) {
            console.error("Error al obtener las fechas de asistencia:", error);
          }
        } else {
          console.warn("ID del profesor o ID del curso no están definidos o no se encontraron asistencias iniciales");
        }
      } catch (error) {
        console.error('Error al obtener las asistencias iniciales:', error);
      }
    };

    fetchInitialAsistencias();
  }, [idCur, idProf, isTakingAsistance]);

  useEffect(() => {
    if (!idProf || !idCur) return;

    // Obtención de asistencias para la fecha seleccionada
    const fetchAsistencias = async () => {
      try {
        const response = await getAsistencias({
          fecha: selectedFecha,
          profesorId: idProf,
          cursoId: idCur,
        });
        setAsistencias(response);
        setErrorMessage(null);
      } catch (error) {
        console.error('Error al obtener las asistencias:', error);
        setErrorMessage(error.message.includes("No se encontraron asistencias") ?
          "DATA NOT FOUND 404" : "Error al obtener las asistencias");
      }
    };

    fetchAsistencias();
  }, [selectedFecha, idCur, idProf]);

  useEffect(() => {
    // Inicialización de tooltips de Bootstrap
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    return () => {
      tooltipTriggerList.forEach(tooltipTriggerEl => {
        const tooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
        if (tooltip) {
          tooltip.dispose();
        }
      });
    };
  }, [falta]);

  useEffect(() => {
    const botonDeshabilitado = fechas.includes(fechaHoy);
    document.getElementById('botonAgregar').disabled = botonDeshabilitado;
  }, [fechas, fechaHoy]);

  const handleRadioChange = (id, asistio) => {
    setAsistencias(prev =>
      prev.map(asistencia =>
        asistencia.id_asistencia === id ? { ...asistencia, asistio } : asistencia
      )
    );
  };

  // Envío de asistencias actualizadas
  const handleSubmit = async () => {
    const cambios = asistencias.map(({ alumno_id, asistio }) => ({
      alumnoId: alumno_id.id_alumno,
      asistio,
    }));

    const camAsis = {
      fecha: selectedFecha,
      profesorId: idProf,
      cursoId: idCur,
      cambios,
    };

    console.log(camAsis);

    try {
      const response = await updateAsistencias(camAsis);
    } catch (error) {
      console.error('Error al actualizar asistencias:', error);
    }
  };

  // Nueva asistencia con IA (Reconocimiento Facial)
  const handleAsistanceRegister = async (tiempo) => {
    const timeSegs = tiempo * 60;
    const data = {
      profesor_id: idProf,
      curso_id: idCur,
      tiempo: timeSegs === 0 ? 900 : timeSegs,
    };
    
    try {
      const response = await registrarAsistencia(data);
      setIsTakingAsistance(false);
      localStorage.removeItem('isTakingAsistance');
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
    }
  };
  
  const handleInputChange = (e) => {
    // Obtenemos el valor del input, limitándolo entre 1 y 15
    const value = Math.max(1, Math.min(15, e.target.value));
    setTime(value);  // Actualizamos el estado con el nuevo valor
  };

  // Activar el modal
  const handleAsistanceClick = () => {
    if (!showAsistanceModal) {
      setShowAsistanceModal(true);
    } else {
      setShowAsistanceModal(false);
      setTakeAsistanceModal(true);
    }
  };

  // Desactivar el modal
  const handleCloseModal = () => {
    setTakeAsistanceModal(false);
    setShowAsistanceModal(false);
    setShowModalStop(false);
  };

  // Detener el registro
  const handleStop = async () => {
    try {
      const response = DetenerRegistroAsistencia();
      setIsTakingAsistance(false);
      localStorage.removeItem('isTakingAsistance');
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
    }
  };

  const handleStopAsistance = () => {
    setShowModalStop(true);
  };

  // Cálculo de la semana seleccionada
  const selectedSemanaCalculated = fechas.indexOf(selectedFecha) + 1;

  // Filtrado de asistencias
  const filteredAsistencias = asistencias.filter(asistencia => {
    const matchesSearchTerm = asistencia.alumno_id.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === '' || (filter === 'asistentes' && asistencia.asistio) || (filter === 'faltantes' && !asistencia.asistio);
    return matchesSearchTerm && matchesFilter;
  });

  // Ordenamiento de asistencias filtradas
  const filteredAndSortedAsistencias = filteredAsistencias.sort((a, b) => {
    return a.alumno_id.nombre.localeCompare(b.alumno_id.nombre);
  });

  // Exportación a Excel
  function exportToExcel(data, fileName = 'datos.xlsx') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Asistencias');

    worksheet.columns = [
      { header: 'Nombre', key: 'Nombre', width: 30 },
      { header: 'Asistencia', key: 'Asistencia', width: 15 },
      { header: 'Falta', key: 'Falta', width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '005478' },
    };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    const mappedAsistencias = data.map((asistencia) => ({
      Nombre: asistencia.alumno_id.nombre,
      Asistencia: asistencia.asistio === true ? '✓' : '',
      Falta: asistencia.asistio === false ? '✓' : '',
    }));

    worksheet.addRows(mappedAsistencias);

    worksheet.getColumn('Asistencia').alignment = { horizontal: 'center' };
    worksheet.getColumn('Falta').alignment = { horizontal: 'center' };

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      saveAs(blob, fileName);
    }).catch((error) => {
      console.error('Error al generar el archivo Excel:', error);
    });
  }

  return (
    <div className="wrapper">
      <NavbarHeader/>

      <div className="page-content-wrapper">
        <div className="page-content">
          <div className="page-breadcrumb d-flex align-items-center mb-3">
            <div className="breadcrumb-title pe-3">Asistencias</div>
            <div className="ps-3">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0 p-0 align-items-center">
                  <li className="breadcrumb-item">
                    <Link to="/home">
                      <ion-icon name="home-outline"></ion-icon>
                    </Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Cursos
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {curso ? curso.nombre : ""}
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Asistencias
                  </li>
                </ol>
              </nav>
            </div>

            <div className="ms-auto d-flex align-items-center">
              {isTakingAsistance && (
                <button
                  onClick={handleStopAsistance}
                  className="plus btn-register mr-4"
                  id="botonDetener"
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  data-bs-original-title='Detener'
                >
                  <i className='lni lni-hand' style={{ fontSize: '0.9rem' }}></i>
                </button>
              )}

              {/* 1er Modal */}
              {showModalStop && (
                <>
                  <div className="modal-backdrop fade show"></div>
                  <div className="modal show fade" tabIndex="-1" aria-hidden="true" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title" style={{ fontSize: '1.2rem' }}>Interrumpir registro</h5>
                        </div>
                        <div className="modal-body">
                          ¿Esta seguro de interrumpir el proceso? No podrá volver a registrar.
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-cancel" onClick={handleCloseModal}>Cancelar</button>
                          <button type="button" className="btn btn-accept" onClick={() => {
                            handleStop();
                            handleCloseModal();
                          }}>Detener</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={handleAsistanceClick}
                className="plus btn-register mr-4"
                id="botonAgregar"
                disabled={fechas.includes(fechaHoy) || disabledButtonAdd}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                data-bs-original-title={fechas.includes(fechaHoy) ? 'Ya hay una asistencia registrada' : 'Registrar'}
              >
                <i className='lni lni-plus' style={{ fontSize: '0.9rem' }}></i>
              </button>
              {asistencias.length > 0 ? (
                <div className="d-flex align-items-center">
                  <select
                    id="fechaSelect"
                    className="form-select border-0"
                    onChange={(e) => setSelectedFecha(e.target.value)}
                    style={{ width: "160px" }}
                  >
                    {fechas.map((fecha, index) => (
                      <option
                        key={index}
                        value={fecha}
                      >
                        {fecha}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="d-flex align-items-center">
                  <h6>Sin Registros</h6>
                </div>
              )}

              {/* 2do Modal */}
              {showAsistanceModal && (
                <>
                  <div className="modal-backdrop fade show"></div>
                  <div className="modal show fade" tabIndex="-1" aria-hidden="true" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title" style={{ fontSize: '1.2rem' }}>Registrar Asistencia</h5>
                        </div>
                        <div className="modal-body">
                          ¿Quieres tomar la asistencia de hoy?
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-cancel" onClick={handleCloseModal}>Cancelar</button>
                          <button type="button" className="btn btn-accept" onClick={handleAsistanceClick}>Aceptar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {/* 3er Modal */}
              {takeAsistanceModal && (
                <>
                  <div className="modal-backdrop fade show"></div>
                  <div className="modal show fade" tabIndex="-1" aria-hidden="true" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-dialog-centered custom-modal-size">
                      <div className="modal-content custom-modal-height">
                        <div className="modal-header">
                          <h5 className="modal-title" style={{ fontSize: '1.2rem' }}>Asistencia</h5>
                        </div>
                        <div className="modal-body text-center d-flex flex-column align-items-center">
                          <h5>¿Por cuánto tiempo deseas que se tome la asistencia?</h5>
                          <input
                            type="number"
                            className="form-control mt-4 custom-input my-5"
                            placeholder="Tiempo"
                            style={{ width: '130px' }}
                            min="0"
                            max="15"
                            value={time}
                            onChange={handleInputChange}
                          />
                          <p className="text-start mt-5">Nota: Si no coloca ningún número, se asumirán 15 minutos.</p>
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-cancel" onClick={handleCloseModal}>Cancelar</button>
                          <button
                            type="button"
                            className="btn btn-accept"
                            onClick={() => {
                              handleAsistanceRegister(time);
                              localStorage.setItem('isTakingAsistance', JSON.stringify(datosCurso));
                              setIsTakingAsistance(true);
                              handleCloseModal();
                            }}
                            >Registrar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>

              )}
            </div>

          </div>

          <hr className="my-2" />

          <div className="d-flex align-items-center justify-content-between mt-4">
            <div
              className="font-22 d-flex justify-content-center"
              onClick={() => {
                if (isEditing) {
                  handleSubmit().then(() => setIsEditing(false));
                } else {
                  setIsEditing(true);
                }
              }}
              style={{ cursor: 'pointer', width: '65px' }}
              data-bs-toggle="tooltip"
              data-bs-original-title={isEditing ? 'Guardar' : 'Editar'}
            >
              <i className={`lni ${isEditing ? 'lni-checkmark' : 'lni-pencil'}`}></i>
            </div>

            <div className="dropdown dropend breadcrumb-title" style={{ width: '65px' }}>
              <button data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
                <div className="font-22" data-bs-toggle="tooltip" title="Filtrar">
                  <i
                    className="lni lni-funnel"
                    onClick={() => setFilter(filter === 'asistentes' ? '' : filter)}
                  ></i>
                </div>
              </button>
              <form className="dropdown-menu p-4">
                <div>
                  <label>Filtros</label>
                </div>
                <hr className="dropdown-divider" />
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="dropdownCheckAsistentes"
                      checked={filter === 'asistentes'}
                      onChange={() => setFilter(filter === 'asistentes' ? '' : 'asistentes')}
                    />
                    <label className="form-check-label" htmlFor="dropdownCheckAsistentes">
                      Asistentes
                    </label>
                  </div>
                </div>
                <div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="dropdownCheckFaltantes"
                      checked={filter === 'faltantes'}
                      onChange={() => setFilter(filter === 'faltantes' ? '' : 'faltantes')}
                    />
                    <label className="form-check-label" htmlFor="dropdownCheckFaltantes">
                      Faltantes
                    </label>
                  </div>
                </div>
              </form>
            </div>

            <div className='font-22 ps-3'>
              <i
                className="lni lni-download"
                onClick={() => exportToExcel(filteredAsistencias, 'Asistencias.xlsx')}
                data-bs-toggle="tooltip"
                data-bs-original-title="Descargar"
              ></i>
            </div>

            <div className="text-center text-uppercase mb-0 d-flex justify-content-center align-items-center" style={{ fontSize: '1.5rem', width: '1300px' }}>
              <h6 className="mb-0" style={{ marginRight: '8px' }}>
                SEMANA {selectedSemanaCalculated}
              </h6>
              {falta && falta.length > 0 && (
                <i
                  className='lni lni-question-circle'
                  style={{ fontSize: '0.9rem' }}
                  data-bs-toggle="tooltip"
                  data-bs-placement="right"
                  data-bs-original-title={`Asistencias: ${falta[0].asistencias} - Faltas: ${falta[0].faltas}`}
                ></i>
              )}
            </div>

            <input
              type="text"
              className="form-control"
              placeholder="Buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '130px' }}
            />
          </div>
          <div className="card mt-4">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-bordered" style={{ width: "100%", tableLayout: "fixed" }}>
                  <thead>
                    <tr style={{ height: "70px", textAlign: "center" }}>
                      <th style={{ width: "30px", verticalAlign: "middle" }}>#</th>
                      <th style={{ verticalAlign: "middle" }}>Nombres</th>
                      <th style={{ verticalAlign: "middle" }}>Asistencia</th>
                      <th style={{ verticalAlign: "middle" }}>Falta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorMessage ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", color: "red" }}>{errorMessage}</td>
                      </tr>
                    ) : (
                      filteredAsistencias.map((asistencia, index) => (
                        <tr key={asistencia.id_asistencia}>
                          <td style={{ textAlign: "center" }}>{index + 1}</td>
                          <td style={{ textAlign: "center" }}>{asistencia.alumno_id.nombre}</td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <input
                                className="form-check-input"
                                type="radio"
                                name={`asistencia-${asistencia.id_asistencia}`}
                                id={`asistio-${asistencia.id_asistencia}`}
                                checked={asistencia.asistio}
                                onChange={() => handleRadioChange(asistencia.id_asistencia, true)}
                                disabled={!isEditing}
                              />
                            </div>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <input
                                className="form-check-input"
                                type="radio"
                                name={`asistencia-${asistencia.id_asistencia}`}
                                id={`falta-${asistencia.id_asistencia}`}
                                checked={!asistencia.asistio}
                                onChange={() => handleRadioChange(asistencia.id_asistencia, false)}
                                disabled={!isEditing}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseAsistance;
