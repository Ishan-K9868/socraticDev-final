import { LearningPathLobby } from '../features/dojo/learningPaths';
import ImplementationBlueprint from '../components/blueprint/ImplementationBlueprint';
import { LEARNING_PATH_BLUEPRINT } from '../components/blueprint/blueprintData';

export default function LearningPathPage() {
    return (
        <>
            <LearningPathLobby />
            <ImplementationBlueprint data={LEARNING_PATH_BLUEPRINT} />
        </>
    );
}
