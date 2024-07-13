import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import './App.css';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { FaTrashAlt } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [timeslots, setTimeslots] = useState([]);
  const [filteredTimeslots, setFilteredTimeslots] = useState([]);
  const [day, setDay] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [packageType, setPackageType] = useState('VIP1');
  const [filterDate, setFilterDate] = useState('');
  const [filterReserved, setFilterReserved] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [roomNumber, setRoomNumber] = useState('1'); 

  useEffect(() => {
    const fetchTimeslots = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'timeslots'));
        const timeslotsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setTimeslots(timeslotsData);
        setFilteredTimeslots(timeslotsData);
        setErrorMessage('');
      } catch (error) {
        console.error('Error fetching timeslots:', error);
        setErrorMessage('Veriler yüklenirken bir hata oluştu.');
      }
    };
    fetchTimeslots();
  }, []);

  const handleAddTimeslot = async (e) => {
    e.preventDefault();
    const dateObj = new Date(day);
    const newSlot = { 
      date: dateObj.toISOString(), 
      start, 
      end, 
      reserved: false, 
      firstName, 
      lastName, 
      phoneNumber, 
      packageType 
    };
    try {
      const docRef = await addDoc(collection(db, 'timeslots'), newSlot);
      const newTimeslot = { ...newSlot, id: docRef.id };
      setTimeslots([...timeslots, newTimeslot]);
      setFilteredTimeslots([...timeslots, newTimeslot]);
      setDay('');
      setStart('');
      setEnd('');
      setFirstName('');
      setLastName('');
      setPhoneNumber('');
      setPackageType('VIP1');
      setRoomNumber('1');
      setErrorMessage('');
    } catch (error) {
      console.error('Error adding timeslot:', error);
      setErrorMessage('Zaman dilimi eklenirken bir hata oluştu.');
    }
  };

  const handleToggleReservation = async (id, reserved) => {
    const slotDoc = doc(db, 'timeslots', id);
    const updatedSlot = { reserved: !reserved };

    try {
      await updateDoc(slotDoc, updatedSlot);
      const updatedTimeslots = timeslots.map(slot => slot.id === id ? { ...slot, ...updatedSlot } : slot);
      setTimeslots(updatedTimeslots);

      applyFilters(updatedTimeslots, filterDate, filterReserved);
      setErrorMessage('');
    } catch (error) {
      console.error('Error updating timeslot:', error);
      setErrorMessage('Rezervasyon durumu güncellenirken bir hata oluştu.');
    }
  };

  const handleDeleteReservation = async (id) => {
    const slotDoc = doc(db, 'timeslots', id);

    try {
      await deleteDoc(slotDoc);
      const updatedTimeslots = timeslots.filter(slot => slot.id !== id);
      setTimeslots(updatedTimeslots);

      applyFilters(updatedTimeslots, filterDate, filterReserved);
      setErrorMessage('');
    } catch (error) {
      console.error('Error deleting timeslot:', error);
      setErrorMessage('Rezervasyon silinirken bir hata oluştu.');
    }
  };

  const handleFilterChange = (e) => {
    const selectedDate = e.target.value;
    setFilterDate(selectedDate);
    applyFilters(timeslots, selectedDate, filterReserved);
  };

  const handleReservedFilterChange = (e) => {
    const selectedReserved = e.target.value;
    setFilterReserved(selectedReserved);
    applyFilters(timeslots, filterDate, selectedReserved);
  };

  const applyFilters = (timeslots, selectedDate, selectedReserved) => {
    let filtered = timeslots;

    if (selectedDate) {
      filtered = filtered.filter(slot => slot.date && slot.date.split('T')[0] === selectedDate);
    }

    if (selectedReserved) {
      filtered = filtered.filter(slot => slot.reserved.toString() === selectedReserved);
    }

    setFilteredTimeslots(filtered);
  };

  const handleClearFilter = () => {
    setFilterDate('');
    setFilterReserved('');
    setFilteredTimeslots(timeslots);
  };

  return (
    <div className="container">
      <div className="header text-center">
        <h1>Rezervasyon</h1>
      </div>
      <div className="form-container">
        <form onSubmit={handleAddTimeslot} className="form-inline justify-content-center">
          <div className="form-group">
            <input
              type="date"
              value={day}
              onChange={e => setDay(e.target.value)}
              className="form-control"
              placeholder="Tarih"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="time"
              value={start}
              onChange={e => setStart(e.target.value)}
              className="form-control"
              placeholder="Başlangıç Saati"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="time"
              value={end}
              onChange={e => setEnd(e.target.value)}
              className="form-control"
              placeholder="Bitiş Saati"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="form-control"
              placeholder="Ad"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="form-control"
              placeholder="Soyad"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              className="form-control"
              placeholder="Telefon Numarası"
              required
            />
          </div>
          <div className="form-group">
            <select
              value={roomNumber}
              onChange={e => setRoomNumber(e.target.value)}
              className="form-control"
              required
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
         
            </select>
          </div>
          <div className="form-group">
            <select
              value={packageType}
              onChange={e => setPackageType(e.target.value)}
              className="form-control"
              required
            >
              <option value="VIP1">VIP1</option>
              <option value="VIP2">VIP2</option>
              <option value="VIP3">VIP3</option>
              <option value="VIP4">VIP4</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Rezervasyon Ekle</button>
        </form>
      </div>
      <div className="filter-container text-center mb-3">
        <input
          type="date"
          value={filterDate}
          onChange={handleFilterChange}
          className="form-control"
          placeholder="Filtre Tarih"
        />
        <select
          value={filterReserved}
          onChange={handleReservedFilterChange}
          className="form-control mt-2"
        >
          <option value="">Tümü</option>
          <option value="true">Rezerve</option>
          <option value="false">Boş</option>
        </select>
        <button onClick={handleClearFilter} className="btn btn-secondary mt-2">Filtreyi Temizle</button>
      </div>
      <div className="table-container">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Başlangıç Saati</th>
              <th>Bitiş Saati</th>
              <th>Durum</th>
              <th>Rezervasyonu Yapan</th>
              <th>Telefon Numarası</th>
              <th>Paket Türü</th>
              <th>Oda Numarası</th>
              <th>İşlem</th>
              <th>Sil</th> {/* Yeni kolon için boş bir th eklendi */}
            </tr>
          </thead>
          <TransitionGroup component="tbody">
            {errorMessage ? (
              <tr>
                <td colSpan="9" className="text-center text-danger">{errorMessage}</td>
              </tr>
            ) : (
              filteredTimeslots.length === 0 ? (
                <tr>
                
                </tr>
              ) : (
                filteredTimeslots.slice(0).reverse().map(slot => (
                  <CSSTransition key={slot.id} timeout={500} classNames="fade">
                    <tr>
                      <td>{new Date(slot.date).toLocaleDateString('tr-TR')}</td>
                      <td>{slot.start}</td>
                      <td>{slot.end}</td>
                      <td>
                        {slot.reserved ? (
                          <span className="reserved">
                            <FontAwesomeIcon icon={faCheckCircle} className="icon" />
                             Rezerve
                          </span>
                        ) : (
                          <span className="empty">
                            <FontAwesomeIcon icon={faTimesCircle} className="icon" />
                             Boş
                          </span>
                        )}
                      </td>
                      <td>{`${slot.firstName} ${slot.lastName}`}</td>
                      <td>{slot.phoneNumber}</td>
                      <td>{slot.packageType}</td>
                      <td>{slot.roomNumber}</td>
                      <td>
                        <button
                          onClick={() => handleToggleReservation(slot.id, slot.reserved)}
                          className={`btn ${slot.reserved ? 'btn-danger' : 'btn-success'}`}
                        >
                          {slot.reserved ? 'Rezervasyonu Kaldır' : 'Rezervasyon Yap'}
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteReservation(slot.id)}
                          className="icon-btn"
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  </CSSTransition>
                ))
              )
            )}
          </TransitionGroup>
        </table>
      </div>
    </div>
  );
}

export default App;