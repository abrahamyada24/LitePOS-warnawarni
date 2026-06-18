const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

/**
 * 1. GET ALL USERS
 * Mengambil daftar seluruh pegawai untuk manajemen tim.
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        imageUrl: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 2. UPDATE USER
 * Mengupdate profil pegawai, role, status aktif, atau reset password.
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password, isActive } = req.body;

    const dataToUpdate = {};

    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (role) dataToUpdate.role = role;

    // Konversi string 'true'/'false' dari FormData menjadi Boolean
    if (isActive !== undefined) {
      dataToUpdate.isActive = isActive === 'true' || isActive === true;
    }

    // Jika admin mengisi password baru, lakukan hashing
    if (password && password.trim() !== "") {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    /**
     * LOGIKA PENYIMPANAN LOKAL:
     * Menggunakan req.file.filename untuk menyimpan path relatif folder uploads.
     */
    if (req.file) {
      dataToUpdate.imageUrl = `/uploads/${req.file.filename}`;
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });

    res.json({ success: true, message: "Data pengguna diperbarui", data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 3. DELETE USER
 * Menghapus akun pegawai dari sistem.
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Proteksi: Mencegah admin menghapus akunnya sendiri secara tidak sengaja
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ success: false, message: "Akses ditolak! Anda tidak bisa menghapus akun Anda sendiri." });
    }

    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: "Pengguna berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};