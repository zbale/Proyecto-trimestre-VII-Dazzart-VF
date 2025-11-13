import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../css/ModalLogin';
import API from '../config/api';
import { useNavigation } from '@react-navigation/native';
import ModalFeedback from './ModalFeedback';


const ModalLogin = ({ visible, onClose, onLogin }) => {
	const [usuario, setUsuario] = useState('');
	const [password, setPassword] = useState('');
	const [showBienvenida, setShowBienvenida] = useState(false);
	const [showBienvenidaUsuario, setShowBienvenidaUsuario] = useState(false);
	const [nombreUsuario, setNombreUsuario] = useState('');
	const [showErrorModal, setShowErrorModal] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [forgotVisible, setForgotVisible] = useState(false);
	const [forgotEmail, setForgotEmail] = useState('');
	const [forgotFeedback, setForgotFeedback] = useState(null);
	const [forgotLoading, setForgotLoading] = useState(false);
	const navigation = useNavigation();

	// EXPONER FUNCION GLOBAL PARA LIMPIAR CAMPOS
	if (typeof global !== 'undefined') {
		global.clearLoginFields = () => {
			setUsuario('');
			setPassword('');
			setShowPassword(false);
		};	
	}

	const handleLogin = async () => {
		try {
			const res = await API.post('/login/login', {
				correo_electronico: usuario.trim(),
				contrasena: password.trim(),
			});
			const { user } = res.data;
			// Guardar usuario en AsyncStorage
			const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
			await AsyncStorage.setItem('usuario', JSON.stringify(user));
			onLogin && onLogin(user);
			if (user.id_rol === 1) {
				setShowBienvenida(true);
			} else {
				setNombreUsuario(user.nombre || user.nombre_usuario || user.correo_electronico || '');
				setShowBienvenidaUsuario(true);
			}
		} catch (err) {
			setShowErrorModal(true);
		}
	};

	// FLUJO OLVIDÓ CONTRASEÑA
		const handleForgotPassword = async () => {
			setForgotLoading(true);
			setForgotFeedback(null);
			try {
				const res = await API.post('/login/forgot-password', { correo_electronico: forgotEmail.trim() });
				setForgotFeedback({ success: true, message: 'Revisa tu correo para restablecer la contraseña.' });
			} catch (err) {
				setForgotFeedback({ success: false, message: err?.response?.data?.message || 'Error al enviar el correo.' });
			}
			setForgotLoading(false);
		};

		// LIMPIAR CAMPOS Y CERRAR MODAL
		const handleClose = () => {
			setUsuario('');
			setPassword('');
			setShowPassword(false);
			onClose && onClose();
		};

			return (
				<>
				{/* MODAL PRINCIPAL DEL LOGIN */}
				<Modal visible={visible} animationType="fade" transparent>
					<TouchableOpacity
						activeOpacity={1}
						style={styles.overlay}
						onPress={handleClose}
					>
						<View style={styles.modalContainer} pointerEvents="box-none">
							<Text style={styles.title}>Iniciar Sesión</Text>

							<View style={styles.inputGroup}>
								<MaterialIcons name="person" size={24} style={styles.iconInput} />
								<TextInput
									style={styles.input}
									placeholder="Correo electrónico"
									value={usuario}
									onChangeText={setUsuario}
									autoCapitalize="none"
									keyboardType="email-address"
									placeholderTextColor="#888"
								/>
							</View>

							<View style={styles.inputGroup}>
								<MaterialIcons name="lock" size={24} style={styles.iconInput} />
								<TextInput
									style={styles.input}
									placeholder="Contraseña"
									value={password}
									onChangeText={setPassword}
									secureTextEntry={!showPassword}
									placeholderTextColor="#888"
								/>
								<TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={{ position: 'absolute', right: 10, top: 10 }}>
									<MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={22} color="#888" />
								</TouchableOpacity>
							</View>

							<TouchableOpacity style={styles.button} onPress={handleLogin}>
								<MaterialIcons name="login" size={22} color="#fff" />
								<Text style={styles.buttonText}>Iniciar sesión</Text>
							</TouchableOpacity>

							<TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
								<Text style={{ color: '#888', fontSize: 28 }}>✖</Text>
							</TouchableOpacity>

													<View style={styles.linksRow}>
														<TouchableOpacity onPress={() => setForgotVisible(true)}>
															<Text style={styles.link}>¿Olvidó su contraseña?</Text>
														</TouchableOpacity>
														<TouchableOpacity onPress={() => navigation.navigate('Register')}>
															<Text style={styles.link}>Registrarse</Text>
														</TouchableOpacity>
													</View>

										{/* MODAL OLVIDÓ CONTRASEÑA */}
										<Modal visible={forgotVisible} animationType="fade" transparent>
											<TouchableOpacity
												activeOpacity={1}
												style={styles.overlay}
												onPress={() => {
													setForgotVisible(false);
													setForgotEmail('');
													setForgotFeedback(null);
												}}
											>
												<View style={styles.modalContainer} pointerEvents="box-none">
													<Text style={styles.title}>Recuperar contraseña</Text>
													<Text style={{ marginBottom: 12, color: '#444', textAlign: 'center' }}>
														Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
													</Text>
													<View style={styles.inputGroup}>
														<MaterialIcons name="email" size={24} style={styles.iconInput} />
														<TextInput
															style={styles.input}
															placeholder="Correo electrónico"
															value={forgotEmail}
															onChangeText={setForgotEmail}
															autoCapitalize="none"
															keyboardType="email-address"
															placeholderTextColor="#888"
														/>
													</View>
													<TouchableOpacity
														style={styles.button}
														onPress={handleForgotPassword}
														disabled={forgotLoading || !forgotEmail.trim()}
													>
														<MaterialIcons name="send" size={22} color="#fff" />
														<Text style={styles.buttonText}>{forgotLoading ? 'Enviando...' : 'Enviar'}</Text>
													</TouchableOpacity>
													{forgotFeedback && (
														<>
															<Text style={{ color: forgotFeedback.success ? '#28a745' : '#d32f2f', marginTop: 10, textAlign: 'center' }}>
																{forgotFeedback.message}
															</Text>
															{forgotFeedback.success && (
																<>
																	<Text style={{ color: '#444', marginTop: 8, textAlign: 'center' }}>
																		Pulsa el botón para abrir la pantalla de restablecer y pega el codigo o la URL que recibiste por correo.
																	</Text>
																	<TouchableOpacity
																		style={[styles.button, { marginTop: 10 }]}
																		onPress={() => {
																			setForgotVisible(false);
																			setForgotEmail('');
																			setForgotFeedback(null);
																			navigation.navigate('RestablecerContra', { token: '' });
																		}}
																	>
																		<Text style={styles.buttonText}>Restablecer Contraseña</Text>
																	</TouchableOpacity>
																</>
															)}
														</>
													)}
													<TouchableOpacity style={styles.closeBtn} onPress={() => {
														setForgotVisible(false);
														setForgotEmail('');
														setForgotFeedback(null);
													}}>
														<Text style={{ color: '#888', fontSize: 28 }}>✖</Text>
													</TouchableOpacity>
												</View>
											</TouchableOpacity>
										</Modal>
						</View>
					</TouchableOpacity>
				</Modal>


						{/* MODAL DE BIENVENIDA ADMIND */}
						<ModalFeedback
							visible={showBienvenida}
							icono="crown"
							titulo="¡Bienvenido administrador!"
							mensaje="Acceso concedido"
							colorFondo="#232526"
							colorTitulo="#28a745"
							colorMensaje="#fff"
							textoBoton="Ir a administración"
							colorBoton="#bfa14a"
							outlineBoton={false}
							onBoton={() => {
								setShowBienvenida(false);
								onClose && onClose();
								navigation.replace('Estadisticas');
							}}
							showClose={false}
						/>

						{/* MODAL DE BIENVENIDA USUARIO*/}
						<ModalFeedback
							visible={showBienvenidaUsuario}
							icono={null}
							titulo="Bienvenido"
							mensaje={
								<View style={{ backgroundColor: '#232526', borderRadius: 12, borderWidth: 2, borderColor: '#bfa14a', padding: 12, marginBottom: 10, marginTop: 6, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8 }}>
									<Text style={{ color: '#28a745', fontWeight: 'bold', fontSize: 20, marginBottom: 2 }}>¡Bienvenido {nombreUsuario}!</Text>
									<Text style={{ color: '#fff', fontSize: 16 }}>¡Nos alegra tenerte de vuelta!</Text>
								</View>
							}
							colorFondo="#fff"
							colorTitulo="#222"
							colorMensaje="#444"
							textoBoton="Cerrar"
							outlineBoton={true}
							onBoton={() => {
								setShowBienvenidaUsuario(false);
								onClose && onClose();
							}}
							showClose={true}
							onClose={() => {
								setShowBienvenidaUsuario(false);
								onClose && onClose();
							}}
						/>

			{/* MODAL DE ERROR DE CREDENCIALES */}
			<ModalFeedback
				visible={showErrorModal}
				icono="ban"
				titulo="¡Credenciales incorrectas!"
				mensaje="Intenta nuevamente"
				colorFondo="#fff"
				colorTitulo="#070707FF"
				colorMensaje="#444"
				textoBoton="Cerrar"
				colorBoton="#d32f2f"
				outlineBoton={true}
				onBoton={() => setShowErrorModal(false)}
				showClose={true}
				onClose={() => setShowErrorModal(false)}
			/>
		</>
	);
};

export default ModalLogin;
