import React, { Component } from 'react'
import firebase from 'firebase'

export default class extends Component {

    passiveSearch(e) {
        
        const dataId = e.target.value

        if (dataId) {

            const dataRef = firebase.database().ref('datas/' + dataId)
            
            dataRef.once('value').then(snapshot => {
                
                if ( snapshot.val() )

                    this.setState({ searchFound: true })

                else this.setState({ searchFound: null })
            })
        }

        else this.setState({ searchFound: null })
    }

    search(e) {
        
        if (e.charCode === 13) 

            window.location.assign('/?key=' + e.target.value)
    }

    connect() {

        firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider())
    }

    disconnect() {

        firebase.auth().signOut()
    }

    render() {

        const { searchFound, user } = this.props
        
        return (

            <nav className="nav">

                <div className="nav-left">
                    
                    <div className="nav-item">

                        <h2 className="title clickable"
                            onClick={ () => window.location.replace('/') }>permadata</h2>
                    </div>
                </div>

                <div className="nav-center">

                    <div className="nav-item">

                        <p className="control has-icons-right">

                            <input type="text" placeholder="rechercher"
                                    className={ 'input search ' + ( searchFound ? ' is-success' : '' ) }
                                    onChange={ e => this.passiveSearch(e) }
                                    onKeyPress={ e => this.search(e) } />

                            {
                                searchFound && (
                                    <span className="icon is-small is-right">

                                        <i className="fa fa-check"></i>
                                    </span>
                                )
                            }
                        </p>
                    </div>
                </div>

                {
                    user ? (

                        <div className="nav-right">

                            <div className="nav-item">

                                <p>salut <b>{ user.displayName.split(' ')[0].toLowerCase() }</b></p>
                            </div>
                            
                            <div className="nav-item">

                                <button type="button" className="button"
                                        onClick={ () => this.disconnect() }>
                                    déconnexion</button>
                            </div>
                        </div>
                    ) : (

                        <div className="nav-right clickable">
                            
                            <div className="nav-item">

                                <p><i>visiteur</i></p>
                            </div>

                            <div className="nav-item">

                                <button type="button" className="button"
                                        onClick={ () => this.connect() }>
                                    connexion</button>
                            </div>
                        </div>
                    )
                }
            </nav>
        )
    }
}