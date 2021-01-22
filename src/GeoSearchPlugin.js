import {withLeaflet, MapControl} from 'react-leaflet'
import {Geosearch} from 'esri-leaflet-geocoder'

class LeafletGeoSearch extends MapControl {
  createLeafletElement(props) {
    const GeoSearch = new Geosearch()

    GeoSearch.on('results', ({latlng}) => {
      props.onSelectLocation(latlng)
    })

    return GeoSearch
  }

  componentDidMount() {
    const {map} = this.props.leaflet

    this.leafletElement.addTo(map)
  }

  componentWillUnmount() {
    this.leafletElement.remove()
  }
}

export default withLeaflet(LeafletGeoSearch)
