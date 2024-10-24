const { nanoid } = require('nanoid');
const bookshelf = require('./bookshelf');

const addBook = (request, handler) => {
	const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

	if (name === undefined) {
		const response = handler.response({
			status: 'fail',
			message: 'Gagal menambahkan buku. Mohon isi nama buku',
		});
		response.code(400);

		return response;
	}

	if (readPage > pageCount) {
		const response = handler.response({
			status: 'fail',
			message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
		});
		response.code(400);

		return response;
	}

	const id = nanoid(16);
	const insertedAt = new Date().toISOString();
	const updatedAt = insertedAt;
	const finished = pageCount === readPage;

	const book = { id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt };
	bookshelf.push(book);

	const isSuccess = bookshelf.filter((note) => note.id === id).length > 0;

	if (isSuccess) {
		const response = handler.response({
			status: 'success',
			message: 'Buku berhasil ditambahkan',
			data: {
				bookId: id,
			},
		});
		response.code(201);

		return response;
	}

	const response = handler.response({
		status: 'error',
		message: 'Catatan gagal ditambahkan',
	});
	response.code(500);

	return response;
};

const getBooks = (request, handler) => {
	const { name, reading, finished } = request.query;

	let filteredBooks = bookshelf;

	if (name !== undefined) {
		filteredBooks = filteredBooks.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
	}

	if (reading !== undefined) {
		filteredBooks = filteredBooks.filter((book) => book.reading === !!Number(reading));
	}

	if (finished !== undefined) {
		filteredBooks = filteredBooks.filter((book) => book.finished === !!Number(finished));
	}

	const response = handler.response({
		status: 'success',
		data: {
			books: filteredBooks.map((book) => ({
				id: book.id,
				name: book.name,
				publisher: book.publisher,
			})),
		},
	});
	response.code(200);

	return response;
};

const getBookById = (request, handler) => {
	const { id } = request.params;
	const book = bookshelf.filter((book) => book.id === id)[0];

	if (book !== undefined) {
		const response = handler.response({
			status: 'success',
			data: { book },
		});
		response.code(200);

		return response;
	}

	const response = handler.response({
		status: 'fail',
		message: 'Buku tidak ditemukan',
	});
	response.code(404);

	return response;
};

const updateBook = (request, handler) => {
	const { id } = request.params;
	const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

	const updatedAt = new Date().toISOString();
	const bookIndex = bookshelf.findIndex((book) => book.id === id);

	if (name === undefined) {
		const response = handler.response({
			status: 'fail',
			message: 'Gagal memperbarui buku. Mohon isi nama buku',
		});
		response.code(400);

		return response;
	}

	if (readPage > pageCount) {
		const response = handler.response({
			status: 'fail',
			message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
		});
		response.code(400);

		return response;
	}

	if (bookIndex !== -1) {
		bookshelf[bookIndex] = { ...bookshelf[bookIndex], name, year, author, summary, publisher, pageCount, readPage, reading, updatedAt };

		const response = handler.response({
			status: 'success',
			message: 'Buku berhasil diperbarui',
		});
		response.code(200);

		return response;
	}

	const response = handler.response({
		status: 'fail',
		message: 'Gagal memperbarui buku. Id tidak ditemukan',
	});
	response.code(404);

	return response;
};

const deleteBook = (request, handler) => {
	const { id } = request.params;
	const bookIndex = bookshelf.findIndex((book) => book.id === id);

	if (bookIndex !== -1) {
		bookshelf.splice(bookIndex, 1);

		const response = handler.response({
			status: 'success',
			message: 'Buku berhasil dihapus',
		});
		response.code(200);

		return response;
	}

	const response = handler.response({
		status: 'fail',
		message: 'Buku gagal dihapus. Id tidak ditemukan',
	});
	response.code(404);

	return response;
};

module.exports = { addBook, getBooks, getBookById, updateBook, deleteBook };
