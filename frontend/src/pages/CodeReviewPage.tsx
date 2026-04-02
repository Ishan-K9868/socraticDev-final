import { CodeReviewLobby } from '../features/dojo/codeReview';
import ImplementationBlueprint from '../components/blueprint/ImplementationBlueprint';
import { CODE_REVIEW_BLUEPRINT } from '../components/blueprint/blueprintData';

export default function CodeReviewPage() {
    return (
        <>
            <CodeReviewLobby />
            <ImplementationBlueprint data={CODE_REVIEW_BLUEPRINT} />
        </>
    );
}
