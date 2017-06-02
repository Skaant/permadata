import React, { Component } from 'react'

import Item from './item'
import AddModal from './add-modal'

export default class extends Component {

    closeForm() {

        this.setState({ addForm: null })
    }

    render() {

        const { dataId, itemType, propType, loaded, refresh, title, items } = this.props
        const addForm = this.state ? this.state.addForm : null

        const itemList = (items || []).map((item, index) => {
            
            const params = { 

                key: index,
                dataId,
                itemType,
                propType,
                refresh,
                index
            }

            return <Item { ...params } { ...item } />
        })

        const addModalParams = {

            dataId,
            itemType,
            propType,
            closeForm: this.closeForm.bind(this),
            refresh
        }
        
        return (

            <div>
                <h3 className={ 'title is-4' + ( itemType === 'keyword' ? ' hidden' : '' ) }>
                    { title }</h3>
                
                <div className="inline-container">

                    { itemList }

                    {
                        loaded && addForm ? <AddModal { ...addModalParams } /> : (

                            <span className="item tag is-info is-medium clickable"
                                    onClick={ () => this.setState({ addForm: true }) }>
                                ajouter</span>
                        )
                    }
                </div>
            </div>
        )
    }
}