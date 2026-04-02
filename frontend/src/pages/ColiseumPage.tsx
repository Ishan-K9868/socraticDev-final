import { ColiseumLobby } from '../features/dojo/coliseum';
import ImplementationBlueprint from '../components/blueprint/ImplementationBlueprint';
import { COLISEUM_BLUEPRINT } from '../components/blueprint/blueprintData';

export default function ColiseumPage() {
    return (
        <>
            <ColiseumLobby />
            <ImplementationBlueprint data={COLISEUM_BLUEPRINT} />
        </>
    );
}
