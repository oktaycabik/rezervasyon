import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import './App.css';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { FaTrashAlt,FaSave, FaTimes } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle,faEdit  } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [timeslots, setTimeslots] = useState([]);
  const [filteredTimeslots, setFilteredTimeslots] = useState([]);
  const [day, setDay] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [packageType, setPackageType] = useState('Sinema');
  const [filterDate, setFilterDate] = useState('');
  const [filterReserved, setFilterReserved] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [roomNumber, setRoomNumber] = useState('1'); 
  const [note, setNote] = useState('');
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    const fetchTimeslots = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'timeslots'));
        const timeslotsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  
        timeslotsData.sort((a, b) => {
          const dateComparison = new Date(a.date) - new Date(b.date);
          if (dateComparison !== 0) return dateComparison;
          if (a.roomNumber !== b.roomNumber) return a.roomNumber.localeCompare(b.roomNumber);
          return a.start.localeCompare(b.start);
        });
  
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
      packageType,
      roomNumber,
      note 
    };
    try {
      const docRef = await addDoc(collection(db, 'timeslots'), newSlot);
      const newTimeslot = { ...newSlot, id: docRef.id };
      const updatedTimeslots = [...timeslots, newTimeslot];
  
      updatedTimeslots.sort((a, b) => {
        const dateComparison = new Date(a.date) - new Date(b.date);
        if (dateComparison !== 0) return dateComparison;
        if (a.roomNumber !== b.roomNumber) return a.roomNumber.localeCompare(b.roomNumber);
        return a.start.localeCompare(b.start);
      });
  
      setTimeslots(updatedTimeslots);
      applyFilters(updatedTimeslots, filterDate, filterReserved);
      setDay('');
      setStart('');
      setEnd('');
      setFirstName('');
      setLastName('');
      setPhoneNumber('');
      setPackageType('Sinema');
      setRoomNumber('1');
      setErrorMessage('');
      setNote('');
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
  
      updatedTimeslots.sort((a, b) => {
        const dateComparison = new Date(a.date) - new Date(b.date);
        if (dateComparison !== 0) return dateComparison;
        if (a.roomNumber !== b.roomNumber) return a.roomNumber.localeCompare(b.roomNumber);
        return a.start.localeCompare(b.start);
      });
  
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
  
      updatedTimeslots.sort((a, b) => {
        const dateComparison = new Date(a.date) - new Date(b.date);
        if (dateComparison !== 0) return dateComparison;
        if (a.roomNumber !== b.roomNumber) return a.roomNumber.localeCompare(b.roomNumber);
        return a.start.localeCompare(b.start);
      });
  
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

    filtered.sort((a, b) => {
      if (a.roomNumber === b.roomNumber) {
        return a.start.localeCompare(b.start);
      }
      return a.roomNumber.localeCompare(b.roomNumber);
    });

    setFilteredTimeslots(filtered);
  };

  const handleClearFilter = () => {
    setFilterDate('');
    setFilterReserved('');
    setFilteredTimeslots(timeslots);
  };

  const handleEditNote = (id, currentNote) => {
    setEditingNote(id);
    setNewNote(currentNote);
  };

  const handleUpdateNote = async (id) => {
    const slotDoc = doc(db, 'timeslots', id);
    const updatedSlot = { note: newNote };

    try {
      await updateDoc(slotDoc, updatedSlot);
      const updatedTimeslots = timeslots.map(slot => slot.id === id ? { ...slot, note: newNote } : slot);
  
      updatedTimeslots.sort((a, b) => {
        const dateComparison = new Date(b.date) - new Date(a.date);
        if (dateComparison !== 0) return dateComparison;
        if (a.roomNumber !== b.roomNumber) return a.roomNumber.localeCompare(b.roomNumber);
        return a.start.localeCompare(b.start);
      });
  
      setTimeslots(updatedTimeslots);
      applyFilters(updatedTimeslots, filterDate, filterReserved);
      setEditingNote(null);
      setNewNote('');
      setErrorMessage('');
    } catch (error) {
      console.error('Error updating note:', error);
      setErrorMessage('Not güncellenirken bir hata oluştu.');
    }
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
              <option value="Sinema">Sinema</option>
              <option value="VIP1">VIP1</option>
              <option value="VIP2">VIP2</option>
              <option value="VIP3">VIP3</option>
              <option value="VIP4">VIP4</option>
            </select>
          </div>
          <div className="form-group">
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="form-control"
              placeholder="Not Alanı"
            />
          </div>
          <button type="submit" className="btn btn-primary">Ekle</button>
        </form>
      </div>
      <div className="filter-container">
        <input
          type="date"
          value={filterDate}
          onChange={handleFilterChange}
          className="form-control"
          placeholder="Tarih Filtrele"
        />
        <select
          value={filterReserved}
          onChange={handleReservedFilterChange}
          className="form-control mt-2"
        >
          <option value="">Hepsi</option>
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
              <th>İsim</th>
              <th>Tel No</th>
              <th>Paket Türü</th>
              <th>Oda No</th>
              <th>Not Alanı</th>
              <th>İşlem</th>
              <th>Sil</th>
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
                filteredTimeslots.map(slot => (
                  <CSSTransition key={slot.id} timeout={500} classNames="fade">
                    <tr>
                      <td>{new Date(slot.date).toLocaleDateString('tr-TR')}</td>
                      <td>{slot.start}</td>
                      <td>{slot.end}</td>
                      <td>
                        {slot.reserved ? (
                          <span className="empty">
                            <FontAwesomeIcon icon={faCheckCircle} className="icon" />
                             Rezerve
                          </span>
                        ) : (
                          <span className="reserved">
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
                        {editingNote === slot.id ? (
                          <div className="d-flex align-items-center">
                            <input
                              type="text"
                              value={newNote}
                              onChange={e => setNewNote(e.target.value)}
                              className="form-control"
                            />
                            <button
                              className="btn btn-success btn-sm ml-1"
                              onClick={() => handleUpdateNote(slot.id)}
                            >
                              <FaSave />
                            </button>
                            <button
                              className="btn btn-danger btn-sm ml-1"
                              onClick={() => setEditingNote(null)}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
                          <div className="updateBtn">
                            {slot.note}
                            <button
                              className="btn btn-primarynew btn-sm ml-2"
                              onClick={() => handleEditNote(slot.id, slot.note)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleReservation(slot.id, slot.reserved)}
                          className={`btn ${slot.reserved ? 'btn-danger' : 'btn-success'}`}
                        >
                          {slot.reserved ? 'İptal' : 'Rezerve'}
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
