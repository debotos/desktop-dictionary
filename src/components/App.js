import React, { Component } from 'react';
import _ from 'lodash';

import me from '../assets/me.png';

const { ipcRenderer, shell } = window.require('electron');

class App extends Component {
  mergeTwoArrayContent = (ArrayOne, ArrayTwo) => {
    // ArrayOne  [{1}, {}, {}, {}, {}, {}] english word array
    // ArrayTwo  [{3}, {}, {}, {}, {}, {}] other word array
    // Result    [{1, 3}, {}, {}, {}, {}, {}] Merge object content

    return ArrayOne.map(singleArrayOneItem => {
      singleArrayOneItem = {
        eng: singleArrayOneItem.word,
        ...singleArrayOneItem
      }; // Rename word to eng
      delete singleArrayOneItem['word'];
      let SameSerialArrayTwoData;
      ArrayTwo.forEach(singleArrayTwoItem => {
        if (singleArrayTwoItem.serial === singleArrayOneItem.serial) {
          delete singleArrayTwoItem['serial'];
          SameSerialArrayTwoData = {
            bangla: singleArrayTwoItem.word,
            ...singleArrayTwoItem
          }; // Rename word to bangla
          delete SameSerialArrayTwoData['word'];
        }
      });
      return { ...singleArrayOneItem, ...SameSerialArrayTwoData };
    });
  };

  componentDidMount() {
    ipcRenderer.on('searching:end', (event, { english, other }) => {
      // console.log('Result Found => ', english, other);
      this.setState({ data: this.mergeTwoArrayContent(english, other) });
      this.setState({ loading: false });
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(['searching:end']);
  }

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      englishSearch: true,
      loading: false,
      searchingFor: null,
      switchBtnStatus: 'Searching English To Bangla'
    };
  }

  handleFormSubmit = e => {
    e.preventDefault();
    let word = this.state.searchingFor;
    if (this.state.englishSearch) {
      ipcRenderer.send('exactEnToBnsearching:start', word);
    } else {
      ipcRenderer.send('exactBnToEnsearching:start', word);
    }
  };
  handleOnChangeInput = e => {
    let input = e.target.value.trim();
    if (input) {
      this.setState({ loading: true });
      this.setState({ searchingFor: e.target.value });
      this.wordSearch();
    } else {
      this.setState({ data: null });
    }
  };
  wordSearch = _.debounce(() => {
    this.searchStart(this.state.searchingFor);
  }, 300);
  searchStart = word => {
    if (this.state.englishSearch) {
      console.log('sending for search => ', word);
      ipcRenderer.send('allEnToBnsearching:start', word);
    } else {
      ipcRenderer.send('allBnToEnsearching:start', word);
    }
  };
  handleSwitchButton = () => {
    if (this.state.englishSearch) {
      this.setState({ switchBtnStatus: 'Searching Bangla To English' });
      this.setState({ englishSearch: false });
    } else {
      this.setState({ switchBtnStatus: 'Searching English To Bangla' });
      this.setState({ englishSearch: true });
    }
  };
  generateList = () => {
    if (this.state.data && this.state.data.length > 0) {
      return this.state.data.map((singleItem, index) => {
        return (
          <div key={index} className="list-item">
            <div
              className="firstEntry"
              style={{ fontWeight: '700px !important' }}
            >
              <h5>{singleItem.eng}</h5>
              <h5
                style={{
                  letterSpacing: '1px',
                  fontSize: '30px',
                  color: '#000000'
                }}
              >
                {singleItem.bangla}
              </h5>
            </div>

            <div className="secondEntry" style={{ color: '#7F7F7F' }}>
              {singleItem.tr && <h5>Uttering: {singleItem.tr}</h5>}
              {singleItem.def && (
                <h5
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 400
                  }}
                >
                  Defination:<hr />
                  {singleItem.def
                    .slice(1, singleItem.def.length - 1)
                    .split(',')
                    .map((singleItem, index) => (
                      <p key={index}>
                        {index +
                          1 +
                          '. ' +
                          singleItem.slice(1, singleItem.length - 1)}
                      </p>
                    ))}
                </h5>
              )}
              {singleItem.ant && (
                <h5>
                  Antonym:<hr />
                  {singleItem.ant
                    .slice(1, singleItem.ant.length - 1)
                    .split(',')
                    .map((singleItem, index) => (
                      <span style={{ marginRight: '5px' }} key={index}>
                        {singleItem.slice(1, singleItem.length - 1) + ';'}
                      </span>
                    ))}
                </h5>
              )}
            </div>

            <div className="thirdEntry" style={{ color: '#5F7BA1' }}>
              {singleItem.exm && (
                <h5>
                  Example: <hr />
                  {singleItem.exm.indexOf('[') < 0
                    ? singleItem.exm
                    : singleItem.exm.slice(2, singleItem.exm.length - 2)}
                </h5>
              )}
            </div>
          </div>
        );
      });
    } else {
      return (
        <div>
          {this.state.searchingFor ? (
            <h4 style={{ fontWeight: 200, opacity: 0.7 }}>Nothing Found!</h4>
          ) : null}
        </div>
      );
    }
  };
  render() {
    return (
      <div className="App">
        <button className="switch-button" onClick={this.handleSwitchButton}>
          {this.state.switchBtnStatus}
        </button>
        <form
          autoComplete="off"
          noValidate
          className="inputSearchBoxWrapper"
          onSubmit={this.handleFormSubmit}
        >
          <input
            className="inputSearchBox"
            name="inputSearchBox"
            type="text"
            placeholder={
              this.state.englishSearch
                ? 'Search English Word...'
                : 'Search Bangla Word...'
            }
            onChange={this.handleOnChangeInput}
          />
          <br />
        </form>
        <div className="ProfileContainer" style={{ position: 'relative' }}>
          <div className="ProfileShadow" />
          <a
            className="myPhotoLink"
            data-toggle="tooltip"
            href="javascript:void(0);"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              shell.openExternal('https://twitter.com/debotos');
              shell.openExternal('https://github.com/debotos');
              shell.openExternal('https://www.facebook.com/debotos.das.1997');
            }}
          >
            <img
              className="myPhoto"
              alt="About me"
              title="Show Profile"
              src={me}
            />
          </a>
        </div>
        {this.state.loading ? (
          <div>
            <div className="searching-loader">
              <div className="searching-loader-inner">
                <div className="searching-loader-line-wrap">
                  <div className="searching-loader-line" />
                </div>
                <div className="searching-loader-line-wrap">
                  <div className="searching-loader-line" />
                </div>
                <div className="searching-loader-line-wrap">
                  <div className="searching-loader-line" />
                </div>
                <div className="searching-loader-line-wrap">
                  <div className="searching-loader-line" />
                </div>
                <div className="searching-loader-line-wrap">
                  <div className="searching-loader-line" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="content-container">
              <div className="list-body slideInUp">{this.generateList()}</div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default App;
