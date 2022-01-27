import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from 'mapbox-gl';
import { v4 as uuid } from 'uuid';
import { Subject } from "rxjs";


//@ts-ignore
mapboxgl.accessToken = 'pk.eyJ1IjoidmljdG9yZmVsaXBlIiwiYSI6ImNreW9yZDZwbjAydzYycHBla2k4a29tMzEifQ.aKC3pdkgo5cXH1PJmKoz4g';

export const useMapBox = (puntoInicial: any) => {
    //referencia al div del mapa
    const mapaDiv = useRef<any>();
    //use callback memoriza
    const setRef = useCallback((node) => {
        mapaDiv.current = node;
    }, []);

    //referencia a los marcadores
    const marcadores = useRef<any>({});

    //Observables de RXJS
    const movimientoMarcador = useRef(new Subject());
    const nuevoMarcador = useRef(new Subject());

    /**
        @NOTA
                no utilizo una funcion tradicional xq al estar dentro de 
                este customHook la crearia varias veves al renderizar el componente
    */
    //funcion para agregar marcadores
    const agregarMarcador = useCallback((lngLat: any, id: string) => {
        const { lng, lat } = lngLat.lngLat || lngLat;
        //creo el nuevo marcador
        const marcker: any = new mapboxgl.Marker();
        marcker.id = id ?? uuid();

        marcker
            .setLngLat([lng, lat])
            .addTo(mapa.current)
            .setDraggable(true);

        //creo una referencia a mis marcadores en un array de marcadores
        marcadores.current[marcker.id] = marcker;

        if (!id) {
            //emision de que se creo un nuevo marcador por medio de RXJS
            nuevoMarcador.current.next({
                id: marcker.id,
                lng,
                lat
            });
        }
        //escuchar movimuentos del marcador
        marcker.on('drag', ({ target }: any) => {
            const { id } = target;
            const { lng, lat } = target.getLngLat();

            //TODO emitir los cambios del marcador
            movimientoMarcador.current.next({
                id,
                lng,
                lat
            });

        });
    }, []);

    //actualizar la ubicacion del marcador
    const actPos = useCallback((marcador: any) => {
      return  marcadores.current[marcador.id].setLngLat([marcador.lng, marcador.lat]);
    }, []);

    //mapa y cordenadas
    const mapa = useRef<any>();
    const [coords, setCords] = useState<any>(puntoInicial)

    useEffect(() => {
        //@ts-ignore
        var map = new mapboxgl.Map({
            container: mapaDiv.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [puntoInicial.lng, puntoInicial.lat],
            zoom: puntoInicial.zoom
        });
        mapa.current = map;
    }, [puntoInicial]);

    //cuando se mueve el mapa
    useEffect(() => {
        mapa.current?.on('move', () => {
            const { lng, lat } = mapa.current.getCenter();
            setCords({
                lng: lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: mapa.current.getZoom().toFixed(2)
            });
        });
    }, []);

    //para agregar marcadores
    useEffect(() => mapa.current?.on('click', agregarMarcador), [agregarMarcador]);

    return {
        agregarMarcador,
        coords,
        nuevoMarcador$: nuevoMarcador.current,
        movimientoMarcador$: movimientoMarcador.current,
        marcadores,
        setRef,
        actPos
    }
};

