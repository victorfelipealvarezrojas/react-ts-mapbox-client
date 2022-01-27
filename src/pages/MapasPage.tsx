import { useContext, useEffect } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useMapBox } from '../hooks/useMapBox';

const puntoInicial = {
    lng: 5,
    lat: 34,
    zoom: 2
}

export const MapasPage = () => {
    const { socket } = useContext<any>(SocketContext);
    //cuando se cosntruye el elemento va a enviar la referencia del div al setRef
    const { coords, setRef, nuevoMarcador$, movimientoMarcador$, agregarMarcador, actPos } = useMapBox(puntoInicial);

    //escuchar marcadores existentes
    useEffect(() => {
        socket.on('marcadores-activos', (marcadores: any) => {
            for (const key of Object.keys(marcadores)) {
                agregarMarcador(marcadores[key], key);
            }
        });

    }, [socket, agregarMarcador]);

    //Escuchar nuevos marcadores
    useEffect(() => {
        socket.on('marcador-nuevo', (marcador: any) => {
            agregarMarcador(marcador, marcador.id);
        });
    }, [nuevoMarcador$, socket]);

    //Movimientos de marcador a emitir
    useEffect(() => {
        movimientoMarcador$.subscribe(movLocation => {
            console.log(movLocation,movLocation)
            socket.emit('marcador-actualizado', movLocation);
        });
    }, [socket, movimientoMarcador$]);

    //mover marcador mediante socket
    useEffect(() => {
        socket.on('marcador-actualizado', (marcador: any) => {
            actPos(marcador);
        })
    }, [socket, actPos]);

    //Nuevo Marcador Emit
    useEffect(() => {
        nuevoMarcador$.subscribe(marcador => {
            //Todo nuevo marcador emitir
            socket.emit('marcador-nuevo', marcador);
        })
    }, [socket]);

    return (
        <div>
            <div className="info">
                lng: {coords.lng} || lat: {coords.lat} || zoom: {coords.zoom}
            </div>
            <div
                ref={setRef}
                className="mapContainer"
            />
        </div>
    );
};