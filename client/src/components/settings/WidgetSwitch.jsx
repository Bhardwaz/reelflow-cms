import { useEffect } from "react";
import { useWidgetStore } from "../../stores/useWidgetStore";
import { useNavigate } from "react-router-dom";
import CarouselSettings from './carousel/CarouselSettings'
import PipSettings from "./pip/PipSettings";

const WidgetSwitch = () => {
    const selectedWidgetId = useWidgetStore((state) => state.selectedWidgetId);
    const widgetsData = useWidgetStore(state => state.widgetsData);
    const currentWidget = widgetsData?.find(widget => widget._id === selectedWidgetId);
    const navigate = useNavigate()

    useEffect(() => {
        if (!selectedWidgetId) {
            navigate('/video/pages')
        }
    }, [selectedWidgetId, navigate])

    const renderWidgetSettings = () => {
        if (!currentWidget) return null;

        switch (currentWidget.widgetType) {
            case 'Carousel':
                return <CarouselSettings />;
            
            case 'Pip':
                return <PipSettings/> ;
            
            default:
                return <div>Unknown Widget Type</div>;
        }
    };

    console.log(currentWidget);
    return (
        <>
           {renderWidgetSettings()}
        </>
    )
}

export default WidgetSwitch