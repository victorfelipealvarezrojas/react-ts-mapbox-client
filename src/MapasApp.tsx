import { SocketProvider } from "./context/SocketContext";
import { MapasPage } from "./pages/MapasPage";

export const MapasApp = () => {
    return (
        <SocketProvider>
            <MapasPage/>
        </SocketProvider>
    );
};

