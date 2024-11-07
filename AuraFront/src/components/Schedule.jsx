import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavbarHeader from "./NavbarHeader";
import { getHorarioByProfesor } from "../services/apiService";
import { encryptId, decryptId } from "../utils/cryptoUtils";

const Schedule = () => {
    const { id } = useParams();
    const [scheduleData, setScheduleData] = useState([]);
    const [decryptedId, setDecryptedId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const decryptedId = decryptId(id);
            console.log(decryptedId);
            setDecryptedId(decryptedId);
        } catch (error) {
            setErrorMessage("Error al procesar el ID del curso");
        }
    }, [id]);

    const request = {
        profesorId: localStorage.getItem('userId'),
        cursoId: decryptedId === "todos" ? "" : decryptedId
    };
    const dayColumns = {
        lunes: 1,
        martes: 2,
        miércoles: 3,
        jueves: 4,
        viernes: 5,
        sábado: 6
    };

    const getRandomColor = (opacity = 1) => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        const red = parseInt(color.slice(1, 3), 16);
        const green = parseInt(color.slice(3, 5), 16);
        const blue = parseInt(color.slice(5, 7), 16);
        return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
    };

    const courseColors = {};

    function addMinutes(time, minutes) {
        const [hours, mins] = time.split(':').map(Number);
        const newMinutes = mins + minutes;
        const newHours = hours + Math.floor(newMinutes / 60);
        const formattedMins = (newMinutes % 60).toString().padStart(2, '0');
        return `${newHours.toString().padStart(2, '0')}:${formattedMins}`;
    }

    const handleCardClick = (idCurso, e) => {
        if (e.target.closest('.icon-access')) return;

        const encryptedId = encryptId(idCurso);
        navigate(`/curso/${encryptedId}`);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getHorarioByProfesor(request);
                const coloredData = data.map(entry => {
                    if (!courseColors[entry.cursoId]) {
                        courseColors[entry.cursoId] = getRandomColor(0.4);
                    }
                    return {
                        ...entry,
                        color: courseColors[entry.cursoId]
                    };
                });

                setScheduleData(coloredData);
            } catch (error) {
                console.error("Error:", error.message);
            }
        };

        fetchData();
    }, [decryptedId]);


    useEffect(() => {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        const tooltipList = tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

        return () => {
            tooltipList.forEach(tooltip => tooltip.dispose());
        };
    }, [scheduleData]);

    return (
        <div className="wrapper">
            <NavbarHeader />

            <div className="page-content-wrapper">
                <div className="page-content">
                    <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
                        <div className="breadcrumb-title pe-3">Horario</div>
                        <div className="ps-3">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb mb-0 p-0 align-items-center">
                                    <li className="breadcrumb-item">
                                        <a href="#" onClick={(e) => e.preventDefault()}>
                                            <i className="lni lni-calendar"></i>
                                        </a>
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>

                    <hr className="my-4" />

                    <div className="card mt-4">
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered">
                                    <thead>
                                        <tr style={{ height: "70px" }}>
                                            <th className="text-center align-middle" style={{ width: "60px" }}>Hora</th>
                                            {Object.keys(dayColumns).map(day => (
                                                <th key={day} className="day-header">
                                                    {day.charAt(0).toUpperCase() + day.slice(1)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.from({ length: 17 }, (_, index) => {
                                            const hourStart = addMinutes("08:00", index * 50);
                                            const hourEnd = addMinutes(hourStart, 50);
                                            const hourLabel = `${hourStart} - ${hourEnd}`;

                                            return (
                                                <tr key={index}>
                                                    <td className="text-center align-middle">{hourLabel}</td>
                                                    {Object.keys(dayColumns).map((day, dayIndex) => {
                                                        const scheduleEntry = scheduleData.find(
                                                            (entry) => entry.dia === day &&
                                                                hourLabel >= entry.hora_inicio &&
                                                                hourLabel < entry.hora_fin
                                                        );

                                                        const isInSchedule = !!scheduleEntry;

                                                        return (
                                                            <td
                                                                key={dayIndex}
                                                                style={{
                                                                    backgroundColor: isInSchedule ? scheduleEntry.color : ""
                                                                }}
                                                                data-bs-toggle={isInSchedule ? "tooltip" : undefined}
                                                                data-bs-placement="top"
                                                                data-bs-title={isInSchedule ? `${scheduleEntry.curso.nombre} - ${scheduleEntry.hora_inicio} a ${scheduleEntry.hora_fin}` : ""}
                                                                onClick={isInSchedule ? (e) => handleCardClick(scheduleEntry.curso.id_curso, e) : undefined}
                                                            >
                                                                {isInSchedule ? (
                                                                    <div
                                                                        className="schedule-block"
                                                                        style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                                    ></div>
                                                                ) : null}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="overlay nav-toggle-icon"></div>
        </div>
    );
}

export default Schedule;
